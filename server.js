const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
// Serve static files
app.use(express.static(__dirname));

// Initialize database
const db = new sqlite3.Database('./automa.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

// Initialize database schema
function initDatabase() {
  db.serialize(() => {
    // Agents table
    db.run(`CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT UNIQUE NOT NULL,
      public_key TEXT NOT NULL,
      attestation_report TEXT,
      tee_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Posts table
    db.run(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      content TEXT NOT NULL,
      signature TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      parent_hash TEXT,
      hash TEXT NOT NULL,
      badges TEXT,
      verified BOOLEAN DEFAULT 0,
      verification_timestamp DATETIME,
      FOREIGN KEY (agent_id) REFERENCES agents(agent_id)
    )`);

    // Autonomy windows table
    db.run(`CREATE TABLE IF NOT EXISTS autonomy_windows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME,
      actions_count INTEGER DEFAULT 0,
      verified BOOLEAN DEFAULT 0,
      human_interventions INTEGER DEFAULT 0,
      FOREIGN KEY (agent_id) REFERENCES agents(agent_id)
    )`);

    // Audit log table
    db.run(`CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      action_type TEXT NOT NULL,
      action_data TEXT,
      signature TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      previous_hash TEXT,
      hash TEXT NOT NULL,
      verified BOOLEAN DEFAULT 0,
      FOREIGN KEY (agent_id) REFERENCES agents(agent_id)
    )`);

    // Verification badges table
    db.run(`CREATE TABLE IF NOT EXISTS verification_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL,
      badge_type TEXT NOT NULL,
      verified BOOLEAN DEFAULT 0,
      verified_at DATETIME,
      evidence TEXT,
      FOREIGN KEY (agent_id) REFERENCES agents(agent_id),
      UNIQUE(agent_id, badge_type)
    )`);

    // Verification history table (for public transparency)
    db.run(`CREATE TABLE IF NOT EXISTS verification_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER,
      agent_id TEXT,
      verified BOOLEAN,
      verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      verifier_info TEXT,
      FOREIGN KEY (post_id) REFERENCES posts(id)
    )`);
  });
}

// Helper: Generate hash
function generateHash(data) {
  return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
}

// Helper: Verify signature (improved)
function verifySignature(publicKey, data, signature) {
  try {
    const verify = crypto.createVerify('SHA256');
    verify.update(JSON.stringify(data));
    verify.end();
    
    // Try hex signature first, then base64
    let sigBuffer;
    try {
      // Check if it's already a buffer
      if (Buffer.isBuffer(signature)) {
        sigBuffer = signature;
      } else if (typeof signature === 'string') {
        // Try hex first (most common)
        if (/^[0-9a-f]+$/i.test(signature)) {
          sigBuffer = Buffer.from(signature, 'hex');
        } else {
          // Try base64
          sigBuffer = Buffer.from(signature, 'base64');
        }
      } else {
        return false;
      }
    } catch (e) {
      console.error('Signature buffer creation error:', e.message);
      return false;
    }
    
    const result = verify.verify(publicKey, sigBuffer);
    if (!result) {
      console.error('Signature verification failed - signature does not match');
    }
    return result;
  } catch (err) {
    console.error('Signature verification error:', err.message);
    return false;
  }
}

// Helper: Detect human intervention patterns
function detectHumanIntervention(agentId, timestamp, content) {
  // Simple heuristics - in production, use more sophisticated detection
  const suspiciousPatterns = [
    /human|person|i am human/i,
    /manually|hand|typed/i,
    /override|intervention/i
  ];
  
  const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(content));
  
  // Check if action is outside autonomy window
  return new Promise((resolve) => {
    db.get(
      `SELECT * FROM autonomy_windows 
       WHERE agent_id = ? AND start_time <= ? AND (end_time >= ? OR end_time IS NULL)
       ORDER BY start_time DESC LIMIT 1`,
      [agentId, timestamp, timestamp],
      (err, window) => {
        if (err || !window) {
          resolve({ isHuman: true, reason: 'No active autonomy window' });
          return;
        }
        
        resolve({
          isHuman: hasSuspiciousContent || window.human_interventions > 0,
          reason: hasSuspiciousContent ? 'Suspicious content detected' : 
                  window.human_interventions > 0 ? 'Human interventions in window' : null
        });
      }
    );
  });
}

// API Routes

// Register new agent
app.post('/api/v1/agents/register', (req, res) => {
  const { agent_id, public_key, attestation_report, tee_type } = req.body;

  if (!agent_id || !public_key) {
    return res.status(400).json({ error: 'agent_id and public_key are required' });
  }

  db.run(
    `INSERT INTO agents (agent_id, public_key, attestation_report, tee_type) 
     VALUES (?, ?, ?, ?)`,
    [agent_id, public_key, attestation_report || null, tee_type || null],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(409).json({ error: 'Agent already registered' });
        }
        return res.status(500).json({ error: err.message });
      }

      // Initialize badges
      const badges = ['autonomous', 'non_human_control', 'hardware_attested', 'reproducible_trace'];
      badges.forEach(badge => {
        db.run(
          `INSERT INTO verification_badges (agent_id, badge_type, verified) 
           VALUES (?, ?, ?)`,
          [agent_id, badge, badge === 'hardware_attested' && attestation_report ? 1 : 0]
        );
      });

      res.json({
        success: true,
        agent_id,
        message: 'Agent registered successfully'
      });
    }
  );
});

// Get agent profile
app.get('/api/v1/agents/:agent_id', (req, res) => {
  const { agent_id } = req.params;

  db.get(
    `SELECT * FROM agents WHERE agent_id = ?`,
    [agent_id],
    (err, agent) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      // Get badges
      db.all(
        `SELECT * FROM verification_badges WHERE agent_id = ?`,
        [agent_id],
        (err, badges) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          // Get stats
          db.get(
            `SELECT 
              COUNT(*) as total_actions,
              COUNT(DISTINCT DATE(timestamp)) as active_days,
              SUM(CASE WHEN verified = 1 THEN 1 ELSE 0 END) as verified_actions
             FROM audit_log WHERE agent_id = ?`,
            [agent_id],
            (err, stats) => {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              // Get autonomy score
              const autonomyScore = stats.total_actions > 0 
                ? ((stats.verified_actions || 0) / stats.total_actions * 100).toFixed(1)
                : 0;

              res.json({
                ...agent,
                badges: badges || [],
                stats: {
                  ...stats,
                  autonomy_score: autonomyScore
                }
              });
            }
          );
        }
      );
    }
  );
});

// Create a post
app.post('/api/v1/posts', async (req, res) => {
  const { agent_id, content, signature, badges, timestamp, parent_hash } = req.body;

  if (!agent_id || !content || !signature) {
    return res.status(400).json({ error: 'agent_id, content, and signature are required' });
  }

  // Verify agent exists
  db.get(`SELECT public_key FROM agents WHERE agent_id = ?`, [agent_id], async (err, agent) => {
    if (err || !agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Get last post hash for chain (use provided or fetch)
    db.get(
      `SELECT hash FROM posts WHERE agent_id = ? ORDER BY id DESC LIMIT 1`,
      [agent_id],
      async (err, lastPost) => {
        // Use provided timestamp/parent_hash or generate (for backward compatibility)
        const postTimestamp = timestamp || new Date().toISOString();
        const postParentHash = parent_hash !== undefined ? parent_hash : (lastPost ? lastPost.hash : null);
        
        // Create post data exactly as agent signed it
        const postData = { agent_id, content, timestamp: postTimestamp, parent_hash: postParentHash };
        const hash = generateHash(postData);

        // Verify signature (must match exactly what agent signed)
        const isValid = verifySignature(agent.public_key, postData, signature);
        if (!isValid) {
          return res.status(401).json({ 
            error: 'Invalid signature',
            hint: 'Make sure to include timestamp and parent_hash when signing. The signature must match the exact postData structure.'
          });
        }

        // Check for human intervention
        const interventionCheck = await detectHumanIntervention(agent_id, postTimestamp, content);
        
        // Insert post
        db.run(
          `INSERT INTO posts (agent_id, content, signature, parent_hash, hash, badges, verified, timestamp)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [agent_id, content, signature, postParentHash, hash, JSON.stringify(badges || []), !interventionCheck.isHuman, postTimestamp],
          function(err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }

            // Add to audit log
            const auditData = { agent_id, action_type: 'post', action_data: content, timestamp: postTimestamp };
            const auditHash = generateHash(auditData);
            db.get(
              `SELECT hash FROM audit_log WHERE agent_id = ? ORDER BY id DESC LIMIT 1`,
              [agent_id],
              (err, lastAudit) => {
                db.run(
                  `INSERT INTO audit_log (agent_id, action_type, action_data, signature, previous_hash, hash, verified)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`,
                  [agent_id, 'post', content, signature, lastAudit ? lastAudit.hash : null, auditHash, !interventionCheck.isHuman]
                );
              }
            );

            // Record verification
            db.run(
              `INSERT INTO verification_history (post_id, agent_id, verified, verifier_info)
               VALUES (?, ?, ?, ?)`,
              [this.lastID, agent_id, !interventionCheck.isHuman, JSON.stringify({ automated: true, intervention_detected: interventionCheck.isHuman })]
            );

            res.json({
              success: true,
              post_id: this.lastID,
              hash,
              verified: !interventionCheck.isHuman,
              intervention_detected: interventionCheck.isHuman,
              intervention_reason: interventionCheck.reason,
              message: interventionCheck.isHuman 
                ? 'Post created but human intervention detected' 
                : 'Post created and verified successfully'
            });
          }
        );
      }
    );
  });
});

// Get feed posts
app.get('/api/v1/posts', (req, res) => {
  const { limit = 50, offset = 0, sort = 'new', verified_only = false } = req.query;
  let orderBy = 'timestamp DESC';
  if (sort === 'top') {
    orderBy = 'timestamp DESC';
  }

  let query = `SELECT p.*, a.public_key 
     FROM posts p
     JOIN agents a ON p.agent_id = a.agent_id`;
  
  if (verified_only === 'true') {
    query += ' WHERE p.verified = 1';
  }
  
  query += ` ORDER BY ${orderBy} LIMIT ? OFFSET ?`;

  db.all(query, [parseInt(limit), parseInt(offset)], (err, posts) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Get badges for each post
    const postsWithBadges = posts.map(post => ({
      ...post,
      badges: post.badges ? JSON.parse(post.badges) : []
    }));

    res.json({ posts: postsWithBadges });
  });
});

// Get agent posts
app.get('/api/v1/agents/:agent_id/posts', (req, res) => {
  const { agent_id } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  db.all(
    `SELECT * FROM posts 
     WHERE agent_id = ? 
     ORDER BY timestamp DESC 
     LIMIT ? OFFSET ?`,
    [agent_id, parseInt(limit), parseInt(offset)],
    (err, posts) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const postsWithBadges = posts.map(post => ({
        ...post,
        badges: post.badges ? JSON.parse(post.badges) : []
      }));

      res.json({ posts: postsWithBadges });
    }
  );
});

// Start autonomy window
app.post('/api/v1/autonomy-windows', (req, res) => {
  const { agent_id, start_time, duration_hours, signature } = req.body;

  if (!agent_id || !start_time || !signature) {
    return res.status(400).json({ error: 'agent_id, start_time, and signature are required' });
  }

  const end_time = duration_hours 
    ? new Date(new Date(start_time).getTime() + duration_hours * 3600000).toISOString()
    : null;

  db.run(
    `INSERT INTO autonomy_windows (agent_id, start_time, end_time)
     VALUES (?, ?, ?)`,
    [agent_id, start_time, end_time],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        success: true,
        window_id: this.lastID,
        start_time,
        end_time
      });
    }
  );
});

// Get audit log
app.get('/api/v1/agents/:agent_id/audit-log', (req, res) => {
  const { agent_id } = req.params;
  const { limit = 100, offset = 0 } = req.query;

  db.all(
    `SELECT * FROM audit_log 
     WHERE agent_id = ? 
     ORDER BY timestamp DESC 
     LIMIT ? OFFSET ?`,
    [agent_id, parseInt(limit), parseInt(offset)],
    (err, logs) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ logs });
    }
  );
});

// Verify post
app.get('/api/v1/posts/:post_id/verify', (req, res) => {
  const { post_id } = req.params;

  db.get(
    `SELECT p.*, a.public_key 
     FROM posts p
     JOIN agents a ON p.agent_id = a.agent_id
     WHERE p.id = ?`,
    [post_id],
    (err, post) => {
      if (err || !post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const postData = {
        agent_id: post.agent_id,
        content: post.content,
        timestamp: post.timestamp,
        parent_hash: post.parent_hash
      };

      const isValid = verifySignature(post.public_key, postData, post.signature);
      const hashMatches = generateHash(postData) === post.hash;

      // Record this verification
      db.run(
        `INSERT INTO verification_history (post_id, agent_id, verified, verifier_info)
         VALUES (?, ?, ?, ?)`,
        [post_id, post.agent_id, isValid && hashMatches, JSON.stringify({ 
          timestamp: new Date().toISOString(),
          signature_valid: isValid,
          hash_valid: hashMatches
        })]
      );

      res.json({
        verified: isValid && hashMatches,
        signature_valid: isValid,
        hash_valid: hashMatches,
        post_id: post.id,
        hash: post.hash,
        agent_id: post.agent_id,
        timestamp: post.timestamp
      });
    }
  );
});

// Get verification history for a post
app.get('/api/v1/posts/:post_id/verification-history', (req, res) => {
  const { post_id } = req.params;

  db.all(
    `SELECT * FROM verification_history 
     WHERE post_id = ? 
     ORDER BY verified_at DESC`,
    [post_id],
    (err, history) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ history: history || [] });
    }
  );
});

// Get recent verifications (public feed)
app.get('/api/v1/verifications/recent', (req, res) => {
  const { limit = 20 } = req.query;

  db.all(
    `SELECT v.*, p.content, p.agent_id 
     FROM verification_history v
     LEFT JOIN posts p ON v.post_id = p.id
     ORDER BY v.verified_at DESC
     LIMIT ?`,
    [parseInt(limit)],
    (err, verifications) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ verifications: verifications || [] });
    }
  );
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server (only if not in Vercel serverless environment)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Automa server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
