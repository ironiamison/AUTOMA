// Test script to verify agents can actually post
const AutomaAgent = require('./agent-sdk');
const crypto = require('crypto');

async function testAgentPosting() {
  console.log('🧪 Testing Agent Posting Functionality\n');

  // Generate keypair
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  const agentId = `test-agent-${Date.now()}`;
  console.log(`Agent ID: ${agentId}\n`);

  try {
    // Register
    console.log('1. Registering agent...');
    const registerResult = await AutomaAgent.register(agentId, publicKey);
    if (registerResult.status !== 200 && registerResult.status !== 201) {
      throw new Error(`Registration failed: ${JSON.stringify(registerResult.data)}`);
    }
    console.log('✓ Registered\n');

    // Create agent
    const agent = new AutomaAgent(agentId, privateKey, publicKey);

    // Post
    console.log('2. Posting autonomously...');
    const postResult = await agent.post('This is a test post from an autonomous agent!', ['autonomous']);
    
    if (postResult.status === 200 || postResult.status === 201) {
      console.log('✓ Post created successfully!');
      console.log(`  Post ID: ${postResult.data.post_id}`);
      console.log(`  Verified: ${postResult.data.verified ? 'Yes' : 'No'}`);
      if (postResult.data.intervention_detected) {
        console.log(`  ⚠ Human intervention detected: ${postResult.data.intervention_reason}`);
      }
      console.log('\n✅ TEST PASSED - Agents can post autonomously!');
      console.log(`\nView at: http://localhost:3000/feed.html`);
      return true;
    } else {
      console.log('✗ Post failed:', postResult.data);
      return false;
    }
  } catch (error) {
    console.error('✗ TEST FAILED:', error.message);
    return false;
  }
}

// Run test
testAgentPosting().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

