import { getUncachableGitHubClient } from '../server/github-client.js';
import { execSync } from 'child_process';

async function createRepository(repoName, description, isPrivate = true) {
  try {
    const octokit = await getUncachableGitHubClient();
    
    const response = await octokit.rest.repos.createForAuthenticatedUser({
      name: repoName,
      description: description,
      private: isPrivate,
      auto_init: false
    });
    
    console.log(`✅ Repository created successfully: ${response.data.html_url}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating repository:', error.message);
    throw error;
  }
}

async function listRepositories() {
  try {
    const octokit = await getUncachableGitHubClient();
    
    const response = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 10
    });
    
    console.log('\n📋 Your recent repositories:');
    response.data.forEach((repo, index) => {
      console.log(`${index + 1}. ${repo.name} - ${repo.description || 'No description'}`);
      console.log(`   ${repo.html_url}`);
      console.log(`   ${repo.private ? '🔒 Private' : '🌍 Public'} • Updated: ${new Date(repo.updated_at).toLocaleDateString()}\n`);
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error listing repositories:', error.message);
    throw error;
  }
}

async function getUserInfo() {
  try {
    const octokit = await getUncachableGitHubClient();
    const response = await octokit.rest.users.getAuthenticated();
    
    console.log(`👤 Connected as: ${response.data.login} (${response.data.name})`);
    console.log(`📧 Email: ${response.data.email || 'Not public'}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error getting user info:', error.message);
    throw error;
  }
}

function addRemoteOrigin(repoUrl) {
  try {
    // Remove existing origin if it exists
    try {
      execSync('git remote remove origin', { stdio: 'pipe' });
    } catch (e) {
      // Origin doesn't exist, that's fine
    }
    
    // Add new origin
    execSync(`git remote add origin ${repoUrl}`, { stdio: 'pipe' });
    console.log(`✅ Added remote origin: ${repoUrl}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error adding remote origin:', error.message);
    throw error;
  }
}

function pushToGitHub() {
  try {
    console.log('📤 Pushing to GitHub...');
    execSync('git push -u origin main', { stdio: 'inherit' });
    console.log('✅ Successfully pushed to GitHub!');
    
    return true;
  } catch (error) {
    console.error('❌ Error pushing to GitHub:', error.message);
    throw error;
  }
}

// Export functions for use
export {
  createRepository,
  listRepositories,
  getUserInfo,
  addRemoteOrigin,
  pushToGitHub
};

// Command line interface
if (process.argv[2]) {
  const command = process.argv[2];
  
  switch (command) {
    case 'user':
      getUserInfo();
      break;
      
    case 'list':
      listRepositories();
      break;
      
    case 'create':
      if (process.argv[3]) {
        const repoName = process.argv[3];
        const description = process.argv[4] || 'Smeaton Healthcare Platform - Full-stack healthcare staffing application';
        const isPrivate = process.argv[5] !== 'public';
        createRepository(repoName, description, isPrivate);
      } else {
        console.log('Usage: node scripts/github-helper.js create <repo-name> [description] [public]');
      }
      break;
      
    default:
      console.log('Available commands:');
      console.log('  user - Show authenticated user info');
      console.log('  list - List your repositories');
      console.log('  create <name> [description] [public] - Create new repository');
  }
}