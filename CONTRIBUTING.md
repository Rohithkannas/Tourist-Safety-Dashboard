# 🤝 Contributing to SafeGuard

Thank you for your interest in contributing to the SafeGuard Tourist Safety Dashboard! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## Getting Started

### Prerequisites

- Node.js v14 or higher
- Git
- Code editor (VS Code recommended)
- Basic knowledge of HTML, CSS, JavaScript
- Familiarity with Git and GitHub

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Tourist-Safety-Dashboard.git
   cd Tourist-Safety-Dashboard
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Rohithkannas/Tourist-Safety-Dashboard.git
   ```

4. **Install dependencies**:
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

### Create a Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

## Development Workflow

### 1. Sync with Upstream

Before starting work, sync with the main repository:

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

### 2. Make Changes

- Write clean, readable code
- Follow the coding standards (see below)
- Test your changes thoroughly
- Update documentation if needed

### 3. Commit Changes

```bash
git add .
git commit -m "type: brief description"
```

See [Commit Guidelines](#commit-guidelines) for commit message format.

### 4. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 5. Create Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template
5. Submit the PR

## Coding Standards

### JavaScript Style Guide

#### General Rules

- Use ES6+ features (const/let, arrow functions, template literals)
- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons at the end of statements
- Maximum line length: 100 characters

#### Naming Conventions

```javascript
// Variables and functions: camelCase
const userName = 'John';
function getUserData() { }

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:4000';

// Classes: PascalCase
class UserManager { }

// Private methods: prefix with underscore
_privateMethod() { }
```

#### Functions

```javascript
// Use arrow functions for callbacks
array.map(item => item.id);

// Use async/await instead of promises
async function fetchData() {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Add JSDoc comments for complex functions
/**
 * Calculates the distance between two coordinates
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  // Implementation
}
```

#### Error Handling

```javascript
// Always handle errors
try {
  const data = await fetchData();
  processData(data);
} catch (error) {
  console.error('Error fetching data:', error);
  showErrorNotification('Failed to load data');
}

// Validate inputs
function processUser(user) {
  if (!user || !user.id) {
    throw new Error('Invalid user object');
  }
  // Process user
}
```

### HTML Style Guide

```html
<!-- Use semantic HTML -->
<header>
  <nav>
    <ul>
      <li><a href="#home">Home</a></li>
    </ul>
  </nav>
</header>

<!-- Use proper indentation -->
<div class="container">
  <div class="row">
    <div class="col">
      Content
    </div>
  </div>
</div>

<!-- Use data attributes for JavaScript hooks -->
<button data-action="submit" data-id="123">Submit</button>

<!-- Add ARIA labels for accessibility -->
<button aria-label="Close dialog">×</button>
```

### CSS Style Guide

```css
/* Use Tailwind utility classes when possible */
<div class="flex items-center justify-between p-4 bg-gray-800">

/* For custom styles, use BEM naming */
.block__element--modifier {
  /* styles */
}

/* Group related properties */
.selector {
  /* Positioning */
  position: absolute;
  top: 0;
  left: 0;
  
  /* Display & Box Model */
  display: flex;
  width: 100%;
  padding: 1rem;
  
  /* Typography */
  font-size: 1rem;
  color: #fff;
  
  /* Visual */
  background: #000;
  border: 1px solid #333;
  
  /* Misc */
  cursor: pointer;
}
```

## Commit Guidelines

### Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(dashboard): add real-time tourist tracking"

# Bug fix
git commit -m "fix(auth): resolve login redirect issue"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactor
git commit -m "refactor(api): simplify error handling logic"
```

### Good Commit Messages

✅ **Good:**
```
feat(geofence): add polygon drawing tool

- Implement Mapbox Draw integration
- Add color selection for zones
- Store zones in localStorage
```

❌ **Bad:**
```
fixed stuff
updated files
changes
```

## Pull Request Process

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Commit messages follow guidelines
- [ ] Branch is up to date with main

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test the changes

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

### Review Process

1. **Automated checks** run on PR submission
2. **Code review** by maintainers
3. **Requested changes** (if any)
4. **Approval** and merge

### After Merge

- Delete your feature branch
- Sync your fork with upstream
- Celebrate! 🎉

## Testing

### Manual Testing

Test your changes in multiple scenarios:

1. **Different browsers**: Chrome, Firefox, Edge, Safari
2. **Different screen sizes**: Desktop, tablet, mobile
3. **Different user roles**: Admin, regular user
4. **Edge cases**: Empty data, network errors, etc.

### Testing Checklist

- [ ] Feature works as expected
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Works in all supported browsers
- [ ] Handles errors gracefully
- [ ] Performance is acceptable

## Documentation

### Code Comments

```javascript
// Good: Explain WHY, not WHAT
// Calculate distance using Haversine formula for accuracy
const distance = calculateHaversineDistance(lat1, lng1, lat2, lng2);

// Bad: Obvious comment
// Set variable to 5
const count = 5;
```

### README Updates

Update README.md when:
- Adding new features
- Changing setup process
- Modifying dependencies
- Updating requirements

### API Documentation

Update `docs/API.md` when:
- Adding new endpoints
- Changing request/response format
- Modifying authentication
- Adding new events

## Questions?

If you have questions:
1. Check existing documentation
2. Search existing issues
3. Ask in discussions
4. Create a new issue

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website (if applicable)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to SafeGuard!** 🙏

Your efforts help make tourism safer in Meghalaya.
