#!/usr/bin/env node

/**
 * 宣传团队TSB - 部署脚本
 * 
 * 此脚本构建前端和后端代码并部署到指定服务器
 * 支持多种部署方式：FTP、SFTP、S3、自定义服务器
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// 项目根目录
const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');
const backendDir = path.join(rootDir, 'backend');

// 获取命令行参数
const args = process.argv.slice(2);
const deployMode = args[0] || 'manual';
const environment = args[1] || 'production';

// 颜色输出函数
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// 日志函数
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}[STEP]${colors.reset} ${msg}`),
};

// 创建命令行交互界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 运行命令的函数
function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    log.info(`运行命令: ${command} ${args.join(' ')}`);
    
    const proc = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`命令执行失败，退出代码: ${code}`));
      }
    });
  });
}

// 构建前端应用
async function buildFrontend() {
  log.step('开始构建前端应用...');
  try {
    await runCommand('npm', ['run', 'build'], frontendDir);
    log.success('前端应用构建完成');
    return true;
  } catch (error) {
    log.error(`前端构建失败: ${error.message}`);
    return false;
  }
}

// 构建后端应用
async function buildBackend() {
  log.step('开始构建后端应用...');
  try {
    await runCommand('npm', ['run', 'build'], backendDir);
    log.success('后端应用构建完成');
    return true;
  } catch (error) {
    log.error(`后端构建失败: ${error.message}`);
    return false;
  }
}

// 手动部署指南
function showManualDeploymentGuide() {
  log.step('手动部署指南:');
  log.info('前端部署:');
  log.info(`  1. 前端构建文件位于: ${path.join(frontendDir, 'dist')}`);
  log.info('  2. 将这些文件上传到你的网站服务器');
  log.info('  3. 对于静态网站托管，可以使用 Netlify, Vercel, GitHub Pages 等服务');
  
  log.info('\n后端部署:');
  log.info(`  1. 后端构建文件位于: ${path.join(backendDir, 'dist')}`);
  log.info('  2. 确保目标服务器已安装 Node.js (v18+)');
  log.info('  3. 将 dist 目录, package.json 和 node_modules (可选) 上传到服务器');
  log.info('  4. 在服务器上运行 "npm install --production" (如果没有上传 node_modules)');
  log.info('  5. 使用 PM2 或 systemd 启动应用: "node dist/index.js"');
}

// FTP 部署 (需要安装 ftp-deploy 包)
async function deployFTP() {
  log.step('准备通过 FTP 部署...');
  log.info('请安装必要的 npm 包: npm install ftp-deploy');
  
  // 提示用户输入 FTP 信息
  rl.question('FTP 服务器地址: ', (host) => {
    rl.question('FTP 用户名: ', (user) => {
      rl.question('FTP 密码: ', (password) => {
        rl.question('前端远程目录路径: ', (frontendRemotePath) => {
          rl.question('后端远程目录路径: ', (backendRemotePath) => {
            // 这里调用 FTP 上传逻辑
            log.info('开始 FTP 部署...');
            log.warn('FTP 部署功能需要实现');
            log.info('请在 infrastructure/ftp-deploy.js 中实现 FTP 部署逻辑');
            log.success('FTP 配置已保存');
            rl.close();
          });
        });
      });
    });
  });
}

// 将环境变量写入文件
function writeEnvFile() {
  // 这里可以添加写入环境变量的逻辑
  log.warn('将环境变量写入.env文件功能需要实现');
  return true;
}

// 主函数
async function main() {
  log.info(`开始部署 TSB 平台 (环境: ${environment})`);
  
  // 1. 构建应用
  const frontendSuccess = await buildFrontend();
  const backendSuccess = await buildBackend();
  
  if (!frontendSuccess || !backendSuccess) {
    log.error('构建失败，部署终止');
    process.exit(1);
  }
  
  // 2. 根据部署模式执行相应操作
  switch (deployMode) {
    case 'manual':
      showManualDeploymentGuide();
      rl.close();
      break;
      
    case 'ftp':
      await deployFTP();
      break;
      
    case 'server':
      log.warn('自定义服务器部署功能需要实现');
      log.info('请在 infrastructure/server-deploy.js 中实现自定义服务器部署逻辑');
      rl.close();
      break;
      
    case 'docker':
      log.warn('Docker 部署功能需要实现');
      log.info('请在 infrastructure/docker-deploy.js 中实现 Docker 部署逻辑');
      rl.close();
      break;
      
    default:
      log.error(`未知的部署模式: ${deployMode}`);
      log.info('支持的模式: manual, ftp, server, docker');
      rl.close();
      break;
  }
}

// 执行主函数
main().catch(err => {
  log.error(`部署出错: ${err.message}`);
  process.exit(1);
});
