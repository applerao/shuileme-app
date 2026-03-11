#!/usr/bin/env node

/**
 * 万能小秘书 - 插件管理 CLI
 * 
 * 使用方法:
 *   wanneng-plugin install <plugin-name>    # 安装插件
 *   wanneng-plugin list                     # 列出已安装插件
 *   wanneng-plugin update <plugin-name>     # 更新插件
 *   wanneng-plugin uninstall <plugin-name>  # 卸载插件
 *   wanneng-plugin search <keyword>         # 搜索插件
 */

const { Command } = require('commander');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

const program = new Command();

// 配置
const CONFIG_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.wanneng-secretary');
const PLUGINS_DIR = path.join(CONFIG_DIR, 'plugins');
const REGISTRY_URL = 'https://registry.wanneng-secretary.com';

// 确保目录存在
async function ensureDirs() {
  await fs.mkdir(CONFIG_DIR, { recursive: true });
  await fs.mkdir(PLUGINS_DIR, { recursive: true });
}

// 读取已安装插件列表
async function getInstalledPlugins() {
  try {
    const indexPath = path.join(PLUGINS_DIR, 'installed.json');
    const data = await fs.readFile(indexPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// 保存已安装插件列表
async function saveInstalledPlugins(plugins) {
  const indexPath = path.join(PLUGINS_DIR, 'installed.json');
  await fs.writeFile(indexPath, JSON.stringify(plugins, null, 2), 'utf-8');
}

// 从 npm 安装插件
async function installFromNpm(packageName) {
  console.log(`📦 正在从 npm 安装：${packageName}`);
  
  try {
    // 使用 npm install
    execSync(`npm install -g ${packageName}`, { stdio: 'inherit' });
    
    // 获取包信息
    const pkgPath = await findGlobalPackage(packageName);
    if (!pkgPath) {
      throw new Error('无法找到安装的包');
    }
    
    // 读取 plugin.json
    const pluginManifest = await readPluginManifest(pkgPath);
    if (!pluginManifest) {
      console.warn('⚠️  这不是一个有效的万能小秘书插件（缺少 plugin.json）');
      return;
    }
    
    // 注册插件
    await registerPlugin(pluginManifest, pkgPath);
    
    console.log(`✅ 插件安装成功：${pluginManifest.name} v${pluginManifest.version}`);
  } catch (error) {
    console.error(`❌ 安装失败：${error.message}`);
    process.exit(1);
  }
}

// 从 GitHub 安装插件
async function installFromGitHub(repoUrl) {
  console.log(`📦 正在从 GitHub 安装：${repoUrl}`);
  
  try {
    // 解析 GitHub URL
    const repoInfo = parseGitHubUrl(repoUrl);
    const tempDir = path.join(CONFIG_DIR, 'temp', repoInfo.name);
    
    // 克隆仓库
    await fs.mkdir(tempDir, { recursive: true });
    execSync(`git clone https://github.com/${repoInfo.owner}/${repoInfo.name}.git ${tempDir}`, { 
      stdio: 'pipe' 
    });
    
    // 读取 plugin.json
    const pluginManifest = await readPluginManifest(tempDir);
    if (!pluginManifest) {
      throw new Error('这不是一个有效的万能小秘书插件（缺少 plugin.json）');
    }
    
    // 移动到插件目录
    const pluginDir = path.join(PLUGINS_DIR, pluginManifest.name);
    await fs.rename(tempDir, pluginDir);
    
    // 注册插件
    await registerPlugin(pluginManifest, pluginDir);
    
    console.log(`✅ 插件安装成功：${pluginManifest.name} v${pluginManifest.version}`);
  } catch (error) {
    console.error(`❌ 安装失败：${error.message}`);
    process.exit(1);
  }
}

// 从本地安装插件
async function installFromLocal(localPath) {
  console.log(`📦 正在从本地安装：${localPath}`);
  
  try {
    const absPath = path.resolve(localPath);
    
    // 读取 plugin.json
    const pluginManifest = await readPluginManifest(absPath);
    if (!pluginManifest) {
      throw new Error('这不是一个有效的万能小秘书插件（缺少 plugin.json）');
    }
    
    // 复制到插件目录
    const pluginDir = path.join(PLUGINS_DIR, pluginManifest.name);
    await fs.cp(absPath, pluginDir, { recursive: true });
    
    // 注册插件
    await registerPlugin(pluginManifest, pluginDir);
    
    console.log(`✅ 插件安装成功：${pluginManifest.name} v${pluginManifest.version}`);
  } catch (error) {
    console.error(`❌ 安装失败：${error.message}`);
    process.exit(1);
  }
}

// 读取插件清单
async function readPluginManifest(pluginPath) {
  try {
    const manifestPath = path.join(pluginPath, 'plugin.json');
    const data = await fs.readFile(manifestPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
}

// 注册插件
async function registerPlugin(manifest, pluginPath) {
  const plugins = await getInstalledPlugins();
  
  // 检查是否已安装
  const existing = plugins.findIndex(p => p.name === manifest.name);
  if (existing !== -1) {
    plugins[existing] = {
      ...manifest,
      path: pluginPath,
      installedAt: new Date().toISOString()
    };
  } else {
    plugins.push({
      ...manifest,
      path: pluginPath,
      installedAt: new Date().toISOString()
    });
  }
  
  await saveInstalledPlugins(plugins);
  
  // 加载插件
  await loadPlugin(manifest, pluginPath);
}

// 加载插件
async function loadPlugin(manifest, pluginPath) {
  console.log(`🔌 正在加载插件：${manifest.name}`);
  
  // 加载命令
  if (manifest.commands) {
    for (const cmd of manifest.commands) {
      console.log(`   - 注册命令：${cmd.name}`);
    }
  }
  
  // 加载技能
  if (manifest.skills) {
    for (const skill of manifest.skills) {
      console.log(`   - 注册技能：${skill.name}`);
    }
  }
  
  console.log(`✅ 插件已加载`);
}

// 卸载插件
async function uninstallPlugin(pluginName) {
  console.log(`🗑️  正在卸载插件：${pluginName}`);
  
  const plugins = await getInstalledPlugins();
  const plugin = plugins.find(p => p.name === pluginName);
  
  if (!plugin) {
    console.error(`❌ 插件未安装：${pluginName}`);
    process.exit(1);
  }
  
  // 删除插件目录
  try {
    await fs.rm(plugin.path, { recursive: true, force: true });
  } catch (error) {
    console.warn(`⚠️  删除插件目录失败：${error.message}`);
  }
  
  // 从列表中移除
  const updated = plugins.filter(p => p.name !== pluginName);
  await saveInstalledPlugins(updated);
  
  console.log(`✅ 插件已卸载：${pluginName}`);
}

// 列出已安装插件
async function listPlugins() {
  const plugins = await getInstalledPlugins();
  
  if (plugins.length === 0) {
    console.log('暂无已安装插件');
    return;
  }
  
  console.log('\n已安装插件：\n');
  for (const plugin of plugins) {
    console.log(`📦 ${plugin.name}`);
    console.log(`   版本：v${plugin.version}`);
    console.log(`   描述：${plugin.description || '无描述'}`);
    console.log(`   位置：${plugin.path}`);
    console.log(`   安装时间：${plugin.installedAt}`);
    console.log('');
  }
}

// 搜索插件
async function searchPlugins(keyword) {
  console.log(`🔍 正在搜索插件：${keyword}`);
  
  // TODO: 实现从注册表搜索
  console.log('⚠️  注册表搜索功能尚未实现');
}

// 更新插件
async function updatePlugin(pluginName) {
  console.log(`🔄 正在更新插件：${pluginName}`);
  
  const plugins = await getInstalledPlugins();
  const plugin = plugins.find(p => p.name === pluginName);
  
  if (!plugin) {
    console.error(`❌ 插件未安装：${pluginName}`);
    process.exit(1);
  }
  
  // TODO: 检查新版本并更新
  console.log('⚠️  自动更新功能尚未实现');
  console.log('请手动卸载后重新安装最新版本');
}

// 查找全局安装的包
async function findGlobalPackage(packageName) {
  try {
    const result = execSync(`npm root -g`, { encoding: 'utf-8' });
    const globalRoot = result.trim();
    const pkgPath = path.join(globalRoot, packageName);
    
    if (await fs.access(pkgPath).then(() => true).catch(() => false)) {
      return pkgPath;
    }
  } catch (error) {
    // 忽略错误
  }
  return null;
}

// 解析 GitHub URL
function parseGitHubUrl(url) {
  const match = url.match(/github\.com[:/]([^/]+)\/([^.]+)(?:\.git)?/);
  if (!match) {
    throw new Error('无效的 GitHub URL');
  }
  return {
    owner: match[1],
    name: match[2]
  };
}

// CLI 命令定义
program
  .name('wanneng-plugin')
  .description('万能小秘书插件管理工具')
  .version('1.0.0');

program
  .command('install <plugin>')
  .description('安装插件')
  .option('-f, --force', '强制安装')
  .option('-g, --github', '从 GitHub 安装')
  .option('-l, --local', '从本地安装')
  .action(async (plugin, options) => {
    await ensureDirs();
    
    if (options.local) {
      await installFromLocal(plugin);
    } else if (options.github || plugin.startsWith('github:') || plugin.includes('github.com')) {
      await installFromGitHub(plugin.replace('github:', ''));
    } else {
      await installFromNpm(plugin);
    }
  });

program
  .command('list')
  .description('列出已安装插件')
  .action(async () => {
    await listPlugins();
  });

program
  .command('uninstall <plugin>')
  .description('卸载插件')
  .action(async (plugin) => {
    await ensureDirs();
    await uninstallPlugin(plugin);
  });

program
  .command('update <plugin>')
  .description('更新插件')
  .action(async (plugin) => {
    await ensureDirs();
    await updatePlugin(plugin);
  });

program
  .command('search <keyword>')
  .description('搜索插件')
  .action(async (keyword) => {
    await searchPlugins(keyword);
  });

// 启动 CLI
program.parse(process.argv);

// 如果没有提供命令，显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
