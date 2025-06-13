#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Mapping from react-icons to lucide-react
const iconMapping = {
  // Fi icons (Feather icons) - most have direct lucide equivalents
  'FiArrowRight': 'ArrowRight',
  'FiArrowLeft': 'ArrowLeft',
  'FiCheck': 'Check',
  'FiCheckCircle': 'CheckCircle',
  'FiX': 'X',
  'FiXCircle': 'XCircle',
  'FiPlus': 'Plus',
  'FiMinus': 'Minus',
  'FiEdit': 'Edit',
  'FiEdit2': 'Edit2',
  'FiEdit3': 'Edit3',
  'FiTrash': 'Trash',
  'FiTrash2': 'Trash2',
  'FiSave': 'Save',
  'FiDownload': 'Download',
  'FiUpload': 'Upload',
  'FiFile': 'File',
  'FiFileText': 'FileText',
  'FiFolder': 'Folder',
  'FiImage': 'Image',
  'FiMail': 'Mail',
  'FiPhone': 'Phone',
  'FiUser': 'User',
  'FiUsers': 'Users',
  'FiLock': 'Lock',
  'FiUnlock': 'Unlock',
  'FiEye': 'Eye',
  'FiEyeOff': 'EyeOff',
  'FiSearch': 'Search',
  'FiSettings': 'Settings',
  'FiMenu': 'Menu',
  'FiGrid': 'Grid',
  'FiList': 'List',
  'FiLayout': 'Layout',
  'FiHome': 'Home',
  'FiCalendar': 'Calendar',
  'FiClock': 'Clock',
  'FiAlertTriangle': 'AlertTriangle',
  'FiAlertCircle': 'AlertCircle',
  'FiInfo': 'Info',
  'FiHelpCircle': 'HelpCircle',
  'FiStar': 'Star',
  'FiHeart': 'Heart',
  'FiThumbsUp': 'ThumbsUp',
  'FiThumbsDown': 'ThumbsDown',
  'FiShare': 'Share',
  'FiShare2': 'Share2',
  'FiLink': 'Link',
  'FiLink2': 'Link2',
  'FiExternalLink': 'ExternalLink',
  'FiCopy': 'Copy',
  'FiClipboard': 'Clipboard',
  'FiCode': 'Code',
  'FiGithub': 'Github',
  'FiLinkedin': 'Linkedin',
  'FiTwitter': 'Twitter',
  'FiGlobe': 'Globe',
  'FiMapPin': 'MapPin',
  'FiBriefcase': 'Briefcase',
  'FiAward': 'Award',
  'FiBook': 'Book',
  'FiBookOpen': 'BookOpen',
  'FiChevronDown': 'ChevronDown',
  'FiChevronUp': 'ChevronUp',
  'FiChevronLeft': 'ChevronLeft',
  'FiChevronRight': 'ChevronRight',
  'FiArrowUp': 'ArrowUp',
  'FiArrowDown': 'ArrowDown',
  'FiRefreshCw': 'RefreshCw',
  'FiLoader': 'Loader',
  'FiZap': 'Zap',
  'FiTrendingUp': 'TrendingUp',
  'FiTrendingDown': 'TrendingDown',
  'FiBarChart': 'BarChart',
  'FiBarChart2': 'BarChart2',
  'FiPieChart': 'PieChart',
  'FiActivity': 'Activity',
  'FiDollarSign': 'DollarSign',
  'FiPercent': 'Percent',
  'FiShield': 'Shield',
  'FiTarget': 'Target',
  'FiGitBranch': 'GitBranch',
  'FiGitCommit': 'GitCommit',
  'FiGitMerge': 'GitMerge',
  'FiGitPullRequest': 'GitPullRequest',
  'FiPackage': 'Package',
  'FiCpu': 'Cpu',
  'FiDatabase': 'Database',
  'FiServer': 'Server',
  'FiMonitor': 'Monitor',
  'FiSmartphone': 'Smartphone',
  'FiTablet': 'Tablet',
  'FiPlay': 'Play',
  'FiPause': 'Pause',
  'FiStop': 'Square',
  'FiSkipForward': 'SkipForward',
  'FiSkipBack': 'SkipBack',
  'FiMaximize': 'Maximize',
  'FiMinimize': 'Minimize',
  'FiMoreVertical': 'MoreVertical',
  'FiMoreHorizontal': 'MoreHorizontal',
  'FiFilter': 'Filter',
  'FiLayers': 'Layers',
  'FiTerminal': 'Terminal',
  
  // Fa icons (Font Awesome) - map to closest lucide equivalents
  'FaArrowRight': 'ArrowRight',
  'FaArrowLeft': 'ArrowLeft',
  'FaCheck': 'Check',
  'FaTimes': 'X',
  'FaPlus': 'Plus',
  'FaMinus': 'Minus',
  'FaEdit': 'Edit',
  'FaTrash': 'Trash',
  'FaSave': 'Save',
  'FaDownload': 'Download',
  'FaUpload': 'Upload',
  'FaFile': 'File',
  'FaFileAlt': 'FileText',
  'FaFolder': 'Folder',
  'FaImage': 'Image',
  'FaEnvelope': 'Mail',
  'FaPhone': 'Phone',
  'FaUser': 'User',
  'FaUsers': 'Users',
  'FaLock': 'Lock',
  'FaUnlock': 'Unlock',
  'FaEye': 'Eye',
  'FaEyeSlash': 'EyeOff',
  'FaSearch': 'Search',
  'FaCog': 'Settings',
  'FaBars': 'Menu',
  'FaThLarge': 'Grid',
  'FaList': 'List',
  'FaHome': 'Home',
  'FaCalendar': 'Calendar',
  'FaClock': 'Clock',
  'FaExclamationTriangle': 'AlertTriangle',
  'FaExclamationCircle': 'AlertCircle',
  'FaInfoCircle': 'Info',
  'FaQuestionCircle': 'HelpCircle',
  'FaStar': 'Star',
  'FaHeart': 'Heart',
  'FaThumbsUp': 'ThumbsUp',
  'FaThumbsDown': 'ThumbsDown',
  'FaShare': 'Share',
  'FaShareAlt': 'Share2',
  'FaLink': 'Link',
  'FaExternalLinkAlt': 'ExternalLink',
  'FaCopy': 'Copy',
  'FaClipboard': 'Clipboard',
  'FaCode': 'Code',
  'FaGithub': 'Github',
  'FaLinkedin': 'Linkedin',
  'FaTwitter': 'Twitter',
  'FaGlobe': 'Globe',
  'FaMapMarkerAlt': 'MapPin',
  'FaBriefcase': 'Briefcase',
  'FaAward': 'Award',
  'FaBook': 'Book',
  'FaBookOpen': 'BookOpen',
  'FaChevronDown': 'ChevronDown',
  'FaChevronUp': 'ChevronUp',
  'FaChevronLeft': 'ChevronLeft',
  'FaChevronRight': 'ChevronRight',
  'FaArrowUp': 'ArrowUp',
  'FaArrowDown': 'ArrowDown',
  'FaSync': 'RefreshCw',
  'FaSpinner': 'Loader',
  'FaBolt': 'Zap',
  'FaChartLine': 'TrendingUp',
  'FaChartBar': 'BarChart',
  'FaChartPie': 'PieChart',
  'FaDollarSign': 'DollarSign',
  'FaPercent': 'Percent',
  'FaShieldAlt': 'Shield',
  'FaBullseye': 'Target',
  'FaServer': 'Server',
  'FaDesktop': 'Monitor',
  'FaMobile': 'Smartphone',
  'FaTablet': 'Tablet',
  'FaPlay': 'Play',
  'FaPause': 'Pause',
  'FaStop': 'Square',
  'FaRocket': 'Rocket',
  'FaKey': 'Key',
  'FaMoon': 'Moon',
  'FaSun': 'Sun',
  'FaCloudDownloadAlt': 'CloudDownload',
  'FaCloudUploadAlt': 'CloudUpload',
  'FaDatabase': 'Database',
  'FaTerminal': 'Terminal',
  'FaLightbulb': 'Lightbulb',
  'FaBug': 'Bug',
  'FaGift': 'Gift',
  'FaFlag': 'Flag',
  'FaTag': 'Tag',
  'FaTags': 'Tags',
  'FaComments': 'MessageSquare',
  'FaComment': 'MessageCircle',
  
  // Hi icons (Heroicons) - map to closest lucide equivalents
  'HiSparkles': 'Sparkles',
  'HiOutlineSparkles': 'Sparkles',
  'HiStar': 'Star',
  'HiOutlineStar': 'Star',
};

// Files to process
const filePatterns = [
  'app/**/*.{ts,tsx,js,jsx}',
  'components/**/*.{ts,tsx,js,jsx}',
  'lib/**/*.{ts,tsx,js,jsx}'
];

// Files to exclude
const excludePatterns = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  '**/build/**'
];

let totalFiles = 0;
let modifiedFiles = 0;
let totalReplacements = 0;
let unmappedIcons = new Set();

function processFile(filePath) {
  totalFiles++;
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let replacements = 0;
    
    // Check if file uses react-icons
    if (!content.includes('react-icons')) {
      return;
    }
    
    // Extract all react-icons imports
    const importRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]react-icons\/(\w+)['"]/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const icons = match[1].split(',').map(icon => icon.trim());
      const library = match[2];
      imports.push({ icons, library, fullMatch: match[0] });
    }
    
    if (imports.length === 0) {
      return;
    }
    
    // Process each import
    const lucideIcons = new Set();
    const unmappedInFile = [];
    
    imports.forEach(({ icons, library, fullMatch }) => {
      icons.forEach(icon => {
        const lucideIcon = iconMapping[icon];
        if (lucideIcon) {
          lucideIcons.add(lucideIcon);
          // Replace icon usage in JSX
          const iconRegex = new RegExp(`<${icon}([\\s/>])`, 'g');
          content = content.replace(iconRegex, `<${lucideIcon}$1`);
          replacements++;
        } else {
          unmappedInFile.push(icon);
          unmappedIcons.add(icon);
        }
      });
      
      // Remove the react-icons import
      content = content.replace(fullMatch + '\n', '');
      content = content.replace(fullMatch, '');
    });
    
    // Add lucide-react import if we have icons to import
    if (lucideIcons.size > 0) {
      const lucideIconsList = Array.from(lucideIcons).sort().join(', ');
      const lucideImport = `import { ${lucideIconsList} } from 'lucide-react';`;
      
      // Find where to insert the import
      const firstImportMatch = content.match(/^import\s+.*$/m);
      if (firstImportMatch) {
        const insertPosition = firstImportMatch.index;
        content = content.slice(0, insertPosition) + lucideImport + '\n' + content.slice(insertPosition);
      } else {
        // No imports found, add at the beginning
        content = lucideImport + '\n\n' + content;
      }
      
      modified = true;
    }
    
    // Write back if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      modifiedFiles++;
      console.log(`✅ ${filePath} - Replaced ${replacements} icon(s)`);
      if (unmappedInFile.length > 0) {
        console.log(`   ⚠️  Unmapped icons: ${unmappedInFile.join(', ')}`);
      }
    }
    
    totalReplacements += replacements;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🔄 Migrating from react-icons to lucide-react...\n');

  // Get all files matching patterns
  const files = [];
  filePatterns.forEach(pattern => {
    const matchedFiles = glob.sync(pattern, { 
      ignore: excludePatterns,
      nodir: true 
    });
    files.push(...matchedFiles);
  });

  // Remove duplicates
  const uniqueFiles = [...new Set(files)];

  console.log(`Found ${uniqueFiles.length} files to check\n`);

  // Process each file
  uniqueFiles.forEach(processFile);

  // Summary
  console.log('\n📊 Summary:');
  console.log(`Total files checked: ${totalFiles}`);
  console.log(`Files modified: ${modifiedFiles}`);
  console.log(`Total icons replaced: ${totalReplacements}`);
  
  if (unmappedIcons.size > 0) {
    console.log('\n⚠️  Unmapped icons that need manual attention:');
    Array.from(unmappedIcons).sort().forEach(icon => {
      console.log(`   - ${icon}`);
    });
    console.log('\nThese icons need to be manually mapped to lucide-react equivalents.');
  }

  if (modifiedFiles > 0) {
    console.log('\n✨ Migration complete! Please review the changes.');
    console.log('💡 Consider running your tests to ensure everything works correctly.');
  } else {
    console.log('\n✨ No react-icons usage found!');
  }
}

// Run the script
main();