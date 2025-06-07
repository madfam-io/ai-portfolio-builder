#!/bin/bash

# MADFAM AI Portfolio Builder - Git Setup Script
# This script configures Git best practices for the project

set -e  # Exit on any error

echo "🚀 Setting up Git configuration for MADFAM AI Portfolio Builder..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository. Please run 'git init' first."
    exit 1
fi

print_status "Configuring Git for this repository..."

# Set commit message template
print_status "Setting up commit message template..."
git config commit.template .gitmessage
print_success "Commit message template configured"

# Configure useful Git aliases
print_status "Setting up Git aliases..."
git config alias.co checkout
git config alias.br branch
git config alias.ci commit
git config alias.st status
git config alias.unstage "reset HEAD --"
git config alias.last "log -1 HEAD"
git config alias.graph "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"
git config alias.pushf "push --force-with-lease"
git config alias.amend "commit --amend --no-edit"
git config alias.undo "reset --soft HEAD~1"
print_success "Git aliases configured"

# Configure line ending handling
print_status "Configuring line endings..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    git config core.autocrlf true
else
    # macOS/Linux
    git config core.autocrlf input
fi
git config core.safecrlf warn
print_success "Line ending configuration set"

# Configure merge and rebase settings
print_status "Configuring merge and rebase settings..."
git config merge.tool vimdiff
git config pull.rebase true
git config rebase.autoStash true
git config merge.ff only
print_success "Merge and rebase settings configured"

# Configure push settings
print_status "Configuring push settings..."
git config push.default simple
git config push.followTags true
print_success "Push settings configured"

# Configure branch settings
print_status "Configuring branch settings..."
git config branch.autosetupmerge always
git config branch.autosetuprebase always
print_success "Branch settings configured"

# Configure diff and log settings
print_status "Configuring diff and log settings..."
git config diff.renames true
git config log.abbrevCommit true
git config log.decorate short
print_success "Diff and log settings configured"

# Set up default branch name
print_status "Setting default branch name to 'main'..."
git config init.defaultBranch main
print_success "Default branch name set to 'main'"

# Check for and configure user information
print_status "Checking user configuration..."
if ! git config user.name > /dev/null; then
    print_warning "Git user.name not set globally"
    read -p "Enter your full name: " username
    git config user.name "$username"
    print_success "User name set for this repository"
fi

if ! git config user.email > /dev/null; then
    print_warning "Git user.email not set globally"
    read -p "Enter your email address: " useremail
    git config user.email "$useremail"
    print_success "User email set for this repository"
fi

# Configure commit signing (optional)
print_status "Checking GPG signing configuration..."
if git config user.signingkey > /dev/null; then
    print_success "GPG signing key already configured"
    read -p "Enable commit signing for this repo? (y/N): " enable_signing
    if [[ $enable_signing =~ ^[Yy]$ ]]; then
        git config commit.gpgsign true
        print_success "Commit signing enabled"
    fi
else
    print_warning "No GPG signing key configured (optional for security)"
fi

# Create .gitattributes if it doesn't exist
if [ ! -f .gitattributes ]; then
    print_status "Creating .gitattributes file..."
    cat > .gitattributes << 'EOF'
# Text files
*.txt text
*.md text
*.json text
*.js text
*.jsx text
*.ts text
*.tsx text
*.css text
*.scss text
*.html text
*.xml text
*.yml text
*.yaml text

# Binary files
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.svg binary
*.woff binary
*.woff2 binary
*.ttf binary
*.eot binary
*.pdf binary

# Archives
*.zip binary
*.tar binary
*.gz binary
*.bz2 binary

# Exclude files from export
.gitignore export-ignore
.gitattributes export-ignore
README.md export-ignore
EOF
    print_success ".gitattributes file created"
fi

# Set up branch protection reminders
print_status "Creating branch protection reminders..."
mkdir -p .git/hooks

# Create pre-push hook to warn about pushing to main
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

protected_branch='main'
current_branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')

if [ $protected_branch = $current_branch ]; then
    echo "🚨 WARNING: You're about to push to the main branch!"
    echo "🤔 Are you sure this is what you want to do?"
    read -p "Continue? (y/N): " -n 1 -r < /dev/tty
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Push cancelled"
        exit 1
    fi
fi
exit 0
EOF

chmod +x .git/hooks/pre-push
print_success "Pre-push hook created"

# Display current configuration
print_status "Current Git configuration for this repository:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "User: $(git config user.name) <$(git config user.email)>"
echo "Default branch: $(git config init.defaultBranch)"
echo "Commit template: $(git config commit.template)"
echo "Push default: $(git config push.default)"
echo "Pull rebase: $(git config pull.rebase)"
echo "Auto CRLF: $(git config core.autocrlf)"

if git config commit.gpgsign > /dev/null; then
    echo "GPG signing: $(git config commit.gpgsign)"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

print_success "Git configuration completed successfully!"

echo ""
echo "📚 Next steps:"
echo "1. Review GIT_WORKFLOW.md for team workflows"
echo "2. Install pre-commit hooks: npm install && npm run prepare"
echo "3. Create your first commit: git add . && git commit"
echo "4. Set up remote repository and push"
echo ""
echo "💡 Useful commands:"
echo "• git graph    - Pretty log with graph"
echo "• git amend    - Amend last commit without editing message"
echo "• git undo     - Undo last commit (keep changes)"
echo "• git pushf    - Force push with lease (safer)"
echo ""
echo "🔒 Security tip: Consider setting up GPG signing for commit verification"
echo ""

print_success "Happy coding! 🚀"