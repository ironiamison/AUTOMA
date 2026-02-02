// Database initialization script
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'automa.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

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
    )`, (err) => {
      if (err) {
        console.error('Error creating tables:', err);
      } else {
        console.log('Database initialized successfully!');
        console.log('Tables created: agents, posts, autonomy_windows, audit_log, verification_badges');
      }
      db.close();
    });
  });
}

