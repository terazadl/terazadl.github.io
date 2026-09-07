#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  console.log(`
📝 用法: npm run note -- "<手记内容>" [选项]
   或者: node scripts/add-note.js "<手记内容>" [选项]

选项:
  -l, --location  地点标尺 (默认: "东京")
  -t, --tags      逗号分隔的标签 (例如: "东京日常,散步")
  -c, --category  分类 (observation 或 reading，默认: observation)
  -b, --badge     徽章文字 (默认根据分类自动设定)
  -p, --photo     本地随手拍照片路径 (将自动复制并引用)
  --no-build      仅写入数据，不自动触发 hexo generate
  -h, --help      查看帮助

示例:
  npm run note -- "今天在早稻田图书馆读完了战后金融史。"
  npm run note -- "神田川的河水很清" -l "东京·高田马场" -t "散步,日常"
  npm run note -- "东京秋天的第一张随手拍" -p ~/Desktop/photo.jpg
`);
  process.exit(0);
}

let text = '';
let location = '东京';
let category = 'observation';
let badge = '';
let tags = [];
let photoPath = '';
let shouldBuild = true;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '-l' || arg === '--location') {
    location = args[++i];
  } else if (arg === '-t' || arg === '--tags') {
    tags = (args[++i] || '').split(/[,，]/).map(s => s.trim()).filter(Boolean);
  } else if (arg === '-c' || arg === '--category') {
    category = args[++i] || 'observation';
  } else if (arg === '-b' || arg === '--badge') {
    badge = args[++i];
  } else if (arg === '-p' || arg === '--photo' || arg === '--image') {
    photoPath = args[++i];
  } else if (arg === '--no-build') {
    shouldBuild = false;
  } else if (!text && !arg.startsWith('-')) {
    text = arg;
  }
}

if (!text) {
  console.error('❌ 错误: 请提供手记正文内容。例如: npm run note -- "手记内容"');
  process.exit(1);
}

// Ensure tags
if (tags.length === 0) {
  tags = category === 'reading' ? ['读书思考'] : ['日常观察'];
}

// Ensure badge
if (!badge) {
  badge = category === 'reading' ? '读书思考' : '日常观察';
}

// Get today's date YYYY-MM-DD (local time, not UTC)
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
const id = `note-${now.getTime()}`;

// Handle photo if provided
let finalImageUrl = '';
if (photoPath) {
  const resolvedPhoto = path.resolve(photoPath);
  if (!fs.existsSync(resolvedPhoto)) {
    console.error(`⚠️ 警告: 未找到图片文件: ${resolvedPhoto}，将跳过图片`);
  } else {
    const ext = path.extname(resolvedPhoto) || '.jpg';
    const destDir = path.resolve(__dirname, '../source/images/notes');
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
    const destFileName = `${id}${ext}`;
    const destPath = path.join(destDir, destFileName);
    fs.copyFileSync(resolvedPhoto, destPath);
    finalImageUrl = `/images/notes/${destFileName}`;
    console.log(`📸 图片已保存至: source/images/notes/${destFileName}`);
  }
}

// Read existing notes.yml
const notesFile = path.resolve(__dirname, '../source/_data/notes.yml');
let notes = [];
if (fs.existsSync(notesFile)) {
  try {
    notes = yaml.load(fs.readFileSync(notesFile, 'utf8')) || [];
  } catch (e) {
    console.error('❌ 错误: 现有 notes.yml 解析失败，已中止以避免覆盖既有手记数据。请先修复该文件后重试。');
    process.exit(1);
  }
}

// Construct new note object
const newNote = {
  id,
  date: dateStr,
  location,
  category,
  badge,
  text,
  tags
};

if (finalImageUrl) {
  newNote.image = finalImageUrl;
}

// Prepend to top (newest first)
notes.unshift(newNote);

// Write back to notes.yml
const dumpedYaml = yaml.dump(notes, { lineWidth: -1, quotingType: '"' });
fs.writeFileSync(notesFile, `# 生活手记与自留地数据源 (Life Stream Notes)\n# 自动按顺序在 /life/ 页面展示，最新的一条排在最前面\n\n${dumpedYaml}`, 'utf8');

console.log(`\n✅ 成功发布手记！`);
console.log(`----------------------------------------`);
console.log(`📅 日期: ${dateStr}`);
console.log(`📍 地点: ${location}`);
console.log(`🏷️ 标签: ${tags.map(t => '#' + t).join(' ')}`);
console.log(`📝 内容: ${text.slice(0, 80)}${text.length > 80 ? '...' : ''}`);
if (finalImageUrl) console.log(`🖼️ 图片: ${finalImageUrl}`);
console.log(`----------------------------------------`);

if (shouldBuild) {
  console.log(`🚀 正在自动更新 Hexo 页面并同步到工作区...`);
  try {
    execSync('npx hexo generate && node checks/check-homepage.js', {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit'
    });
    // Sync to machiya if machiya directory exists
    const machiyaDir = path.resolve(__dirname, '../../machiya');
    if (fs.existsSync(machiyaDir)) {
      execSync('mkdir -p ../machiya/life ../machiya/css && cp public/life/index.html ../machiya/life/index.html && cp public/css/main.css ../machiya/css/main.css', {
        cwd: path.resolve(__dirname, '..'),
        stdio: 'inherit'
      });
      console.log(`✨ 静态文件已自动同步至 machiya 工作区！`);
    }
    console.log(`🎉 /life/ 页面已更新完毕！`);
  } catch (err) {
    console.error(`⚠️ 构建时遇到问题:`, err.message);
  }
}
