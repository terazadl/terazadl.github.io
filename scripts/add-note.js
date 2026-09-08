'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

function sanitizePath(input) {
  if (!input) return '';
  let p = input.trim();
  if ((p.startsWith('"') && p.endsWith('"')) || (p.startsWith("'") && p.endsWith("'"))) {
    p = p.slice(1, -1);
  }
  // Handle escaped spaces from terminal drag-and-drop
  p = p.replace(/\\ /g, ' ');
  // Handle tilde ~
  if (p.startsWith('~')) {
    const home = process.env.HOME || process.env.USERPROFILE || '';
    p = path.join(home, p.slice(1));
  }
  return path.resolve(p);
}

async function askQuestion(it, query) {
  if (query) process.stdout.write(query);
  const { value, done } = await it.next();
  if (done) return '';
  return value || '';
}

async function askContent(it) {
  console.log('📝 手记正文 (直接输入/粘贴，按回车提交；若需多行可输入 :m 回车进入多行模式):');
  process.stdout.write('> ');
  const firstLine = await askQuestion(it, '');
  if (firstLine.trim() === ':m' || firstLine.trim() === ':multi') {
    console.log('📖 已进入多行模式 (可连续输入或粘贴段落，连续输入两次回车或输入 :end 结束):');
    const lines = [];
    while (true) {
      process.stdout.write('> ');
      const line = await askQuestion(it, '');
      if (line.trim() === '' && lines.length > 0) {
        break;
      }
      if (line.trim() === ':end') {
        break;
      }
      lines.push(line);
    }
    return lines.join('\n').trim();
  }
  return firstLine.trim().replace(/\\n/g, '\n');
}

function printHelp() {
  console.log(`
╭────────────────────────────────────────────────────────╮
│          🖋️  生活手记 / 随笔发布助手 (Life Stream)        │
╰────────────────────────────────────────────────────────╯

用法 1: 交互式向导 (零门槛推荐)
   npm run note
   或者: ./bin/note

用法 2: 单行快速命令
   npm run note -- "<手记内容>" [选项]

选项:
   -l, --location   地点标尺 (默认: "东京")
   -t, --tags       逗号分隔的标签 (例如: "观影,随想")
   -c, --category   分类 (observation 或 reading，默认: observation)
   -b, --badge      徽章文字 (例如: "观影随想"、"日常观察"、"读书思考")
   -p, --photo      本地随手拍照片路径 (将自动复制并引用)
   --deploy         生成后立即提交 git 并发布到 GitHub Pages 线上
   --no-build       仅写入 notes.yml 数据，不触发 hexo generate
   -i, --interactive 强制启动交互式向导
   -h, --help       查看本帮助

示例:
   npm run note
   npm run note -- "今天在早稻田图书馆读完了战后金融史。" --deploy
   npm run note -- "神田川的河水很清" -l "东京·高田马场" -t "散步,日常"
`);
}

async function runInteractive() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: Boolean(process.stdin.isTTY)
  });
  const it = rl[Symbol.asyncIterator]();

  console.log('\n╭────────────────────────────────────────────────────────╮');
  console.log('│          🖋️  生活手记 / 随笔发布助手 (Life Stream)        │');
  console.log('╰────────────────────────────────────────────────────────╯\n');

  let text = '';
  while (!text) {
    text = await askContent(it);
    if (!text) {
      console.log('⚠️ 正文不能为空，请重新输入。\n');
    }
  }

  console.log('');
  const locInput = await askQuestion(it, '📍 发生地点 [默认: 东京]: ');
  const location = locInput.trim() || '东京';

  console.log('\n🏷️ 分类与徽章:');
  console.log('   1. 观影随想 (默认)');
  console.log('   2. 日常观察');
  console.log('   3. 读书思考');
  console.log('   4. 自定义');
  const catChoice = await askQuestion(it, '请选择分类 [1-4，默认 1]: ');
  let category = 'observation';
  let badge = '观影随想';
  let defaultTags = ['电影', '随笔'];

  if (catChoice.trim() === '2') {
    category = 'observation';
    badge = '日常观察';
    defaultTags = ['日常观察'];
  } else if (catChoice.trim() === '3') {
    category = 'reading';
    badge = '读书思考';
    defaultTags = ['读书思考'];
  } else if (catChoice.trim() === '4') {
    const customBadge = await askQuestion(it, '请输入自定义徽章文字 (例如: 咖啡寻店): ');
    badge = customBadge.trim() || '日常随想';
    defaultTags = [badge];
  }

  console.log('');
  const tagsInput = await askQuestion(it, `🏷️ 标签 [逗号分隔，直接回车默认: ${defaultTags.join(',')}]: `);
  const tags = tagsInput.trim()
    ? tagsInput.split(/[,，]/).map(s => s.trim()).filter(Boolean)
    : defaultTags;

  console.log('');
  const photoInput = await askQuestion(it, '🖼️ 本地配图路径 [可选，直接把图片拖入终端回车，无图直接回车]: ');
  const photoPath = sanitizePath(photoInput);

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  console.log('\n╭────────────────────────────────────────────────────────╮');
  console.log('│                      手记预览                          │');
  console.log('├────────────────────────────────────────────────────────┤');
  console.log(`│ 📅 日期: ${dateStr}`);
  console.log(`│ 📍 地点: ${location}`);
  console.log(`│ 🏷️ 徽章: ${badge}`);
  console.log(`│ 🔖 标签: ${tags.map(t => '#' + t).join(' ')}`);
  console.log(`│ 📝 内容: ${text.slice(0, 60)}${text.length > 60 ? '...' : ''}`);
  console.log(`│ 🖼️ 配图: ${photoPath ? photoPath : '(无)'}`);
  console.log('╰────────────────────────────────────────────────────────╯\n');

  const actionChoice = (await askQuestion(it, '🚀 是否确认并立即部署发布到网站？ [Y: 部署上线 / n: 仅本地构建 / c: 取消] (默认: Y): ')).trim().toLowerCase();

  if (actionChoice === 'c' || actionChoice === 'cancel') {
    console.log('❌ 已取消发布，未作任何更改。');
    rl.close();
    process.exit(0);
  }

  const shouldDeploy = actionChoice !== 'n';
  rl.close();

  await publishNote({
    text,
    location,
    category,
    badge,
    tags,
    photoPath,
    shouldBuild: true,
    shouldDeploy
  });
}

async function publishNote({ text, location, category, badge, tags, photoPath, shouldBuild, shouldDeploy }) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const id = `note-${now.getTime()}`;

  let finalImageUrl = '';
  if (photoPath) {
    if (!fs.existsSync(photoPath)) {
      console.warn(`⚠️ 警告: 未找到图片文件: ${photoPath}，跳过配图`);
    } else {
      const ext = path.extname(photoPath) || '.jpg';
      const destDir = path.resolve(__dirname, '../source/images/notes');
      if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
      const destFileName = `${id}${ext}`;
      const destPath = path.join(destDir, destFileName);
      fs.copyFileSync(photoPath, destPath);
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
      console.error('❌ 错误: 现有 notes.yml 解析失败，已中止。', e);
      process.exit(1);
    }
  }

  const newNote = {
    id,
    date: dateStr,
    location,
    category,
    badge,
    text,
    tags
  };
  if (finalImageUrl) newNote.image = finalImageUrl;

  // Prepend to top
  notes.unshift(newNote);
  const dumpedYaml = yaml.dump(notes, { lineWidth: -1, quotingType: '"' });
  fs.writeFileSync(
    notesFile,
    `# 生活手记与自留地数据源 (Life Stream Notes)\n# 自动按顺序在 /life/ 页面展示，最新的一条排在最前面\n\n${dumpedYaml}`,
    'utf8'
  );

  console.log(`\n✅ 成功记录手记到 source/_data/notes.yml`);

  if (shouldBuild) {
    console.log(`🔨 正在重新编译页面 (hexo generate)...`);
    try {
      execSync('npx hexo generate && node checks/check-homepage.js', {
        cwd: path.resolve(__dirname, '..'),
        stdio: 'inherit'
      });

      // Sync to machiya if exists
      const machiyaDir = path.resolve(__dirname, '../../machiya');
      if (fs.existsSync(machiyaDir)) {
        execSync('mkdir -p ../machiya/life ../machiya/css && cp public/life/index.html ../machiya/life/index.html && cp public/css/main.css ../machiya/css/main.css', {
          cwd: path.resolve(__dirname, '..'),
          stdio: 'inherit'
        });
        console.log(`✨ 静态文件已自动同步至 machiya 工作区！`);
      }
    } catch (err) {
      console.error(`⚠️ 构建时遇到问题:`, err.message);
      return;
    }
  }

  if (shouldDeploy) {
    console.log(`\n🚀 [1/3] 正在提交源码变更 (git commit)...`);
    try {
      execSync('git add source/_data/notes.yml source/images/notes', {
        cwd: path.resolve(__dirname, '..'),
        stdio: 'inherit'
      });
      const summary = text.slice(0, 25).replace(/["`$\\]/g, '');
      execSync(`git commit -m "feat(life): add note: ${summary}"`, {
        cwd: path.resolve(__dirname, '..'),
        stdio: 'inherit'
      });

      console.log(`🚀 [2/3] 正在同步推送源码分支 (git push)...`);
      try {
        execSync('git push', { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
      } catch (pushErr) {
        console.warn(`⚠️ git push 遇到提示 (可稍后手动同步): ${pushErr.message}`);
      }

      console.log(`🚀 [3/3] 正在发布静态页面到 GitHub Pages (hexo deploy)...`);
      execSync('npx hexo deploy', {
        cwd: path.resolve(__dirname, '..'),
        stdio: 'inherit'
      });

      console.log(`\n🎉🎉 恭喜！手记已成功发布上线！`);
      console.log(`🔗 线上自留地地址: https://terazadl.github.io/life/`);
    } catch (deployErr) {
      console.error(`⚠️ 部署过程中遇到异常:`, deployErr.message);
    }
  } else {
    console.log(`\n✨ 已保存为本地构建！`);
    console.log(`🔗 本地预览地址: http://localhost:4000/life/`);
    console.log(`💡 稍后确认满意后，可随时运行 npm run deploy 一键上线。`);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('-h') || args.includes('--help')) {
    printHelp();
    process.exit(0);
  }

  if (args.length === 0 || args.includes('-i') || args.includes('--interactive')) {
    await runInteractive();
    return;
  }

  // CLI argument mode
  let text = '';
  let location = '东京';
  let category = 'observation';
  let badge = '';
  let tags = [];
  let photoPath = '';
  let shouldBuild = true;
  let shouldDeploy = false;

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
      photoPath = sanitizePath(args[++i]);
    } else if (arg === '--deploy') {
      shouldDeploy = true;
    } else if (arg === '--no-build') {
      shouldBuild = false;
    } else if (!text && !arg.startsWith('-')) {
      text = arg;
    }
  }

  if (!text) {
    console.error('❌ 错误: 未提供手记正文。直接运行 `npm run note` 可开启交互式输入向导。');
    process.exit(1);
  }

  if (badge) {
    if (badge === '读书思考' || badge.includes('读') || badge.includes('书')) {
      category = 'reading';
    }
  } else {
    badge = category === 'reading' ? '读书思考' : '日常观察';
  }

  if (tags.length === 0) {
    tags = category === 'reading' ? ['读书思考'] : ['日常观察'];
  }

  await publishNote({
    text,
    location,
    category,
    badge,
    tags,
    photoPath,
    shouldBuild,
    shouldDeploy
  });
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ 执行失败:', err);
    process.exit(1);
  });
}

