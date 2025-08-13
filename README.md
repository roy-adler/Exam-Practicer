# Terraform Associate 003 Practice Test

An interactive, web-based practice test application for the Terraform Associate 003 certification exam. Built with modern web technologies and designed for optimal learning experience.

## 🚀 Features

- **Interactive Quiz Interface**: Clean, responsive design that works on all devices
- **Randomized Questions**: Questions and answer choices are shuffled for each attempt
- **Progress Tracking**: Visual progress bar and question counter
- **Timer**: Built-in timer to simulate real exam conditions
- **Practice Mode**: Focus on questions you answered incorrectly
- **Review System**: Comprehensive review of all questions with explanations
- **File Upload**: Load custom question sets via JSON files
- **Export Functionality**: Export questions for offline study
- **Accessibility**: WCAG compliant with screen reader support
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Styling**: CSS Custom Properties, Flexbox, Grid, Responsive Design
- **Server**: Nginx (production), Python HTTP Server (development)
- **Containerization**: Docker with multi-stage builds
- **Security**: Security headers, rate limiting, non-root user execution

## 📋 Prerequisites

- **Docker** (for production deployment)
- **Python 3** (for local development)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 🚀 Quick Start

### Option 1: Docker (Recommended for Production)

```bash
# Clone the repository
git clone https://github.com/yourusername/terraform-practice-test.git
cd terraform-practice-test

# Build and run with Docker Compose
docker-compose up -d

# Access the application
open http://localhost:8080
```

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/terraform-practice-test.git
cd terraform-practice-test

# Start local development server
python3 -m http.server 8000

# Access the application
open http://localhost:8000
```

### Option 3: Direct File Access

Simply open `index.html` in your web browser (some features may be limited due to CORS policies).

## 🐳 Docker Commands

```bash
# Build the image
docker build -t terraform-quiz .

# Run the container
docker run -p 8080:80 terraform-quiz

# Using Docker Compose
docker-compose up -d          # Start services
docker-compose down           # Stop services
docker-compose logs -f        # View logs
docker-compose restart        # Restart services
```

## 📁 Project Structure

```
terraform-practice-test/
├── app.js              # Main application logic
├── index.html          # HTML structure
├── styles.css          # Styling and responsive design
├── questions.json      # Question bank
├── Dockerfile          # Multi-stage Docker build
├── docker-compose.yml  # Docker Compose configuration
├── nginx.conf          # Nginx server configuration
├── package.json        # Project metadata and scripts
└── README.md           # This file
```

## 🎯 Usage

### Starting a Quiz

1. **Select Question Count**: Choose between 5-40 questions
2. **Configure Options**: 
   - Toggle choice shuffling
   - Enable/disable explanations
3. **Begin**: Click "Start quiz" to begin

### During the Quiz

- **Navigate**: Use Previous/Next buttons or answer choices
- **Track Progress**: Monitor progress bar and question counter
- **Timer**: Watch the live timer for pacing
- **Submit**: Complete all questions and submit when ready

### After Submission

- **Review Results**: See your score and performance breakdown
- **Practice Wrong Answers**: Focus on questions you missed
- **Review All**: Go through every question with explanations
- **Export**: Download questions for offline study

### Custom Questions

1. **Prepare JSON File**: Format questions according to the schema
2. **Upload**: Use the "Load questions" feature
3. **Validate**: Ensure proper format and structure

## 📊 Question Format

Questions should follow this JSON structure:

```json
[
  {
    "q": "Question text here?",
    "choices": [
      "Choice A",
      "Choice B", 
      "Choice C",
      "Choice D"
    ],
    "answer": 0,
    "explain": "Explanation of the correct answer",
    "tags": ["category1", "category2"]
  }
]
```

**Field Descriptions:**
- `q`: The question text
- `choices`: Array of answer choices
- `answer`: Index of the correct answer (0-based)
- `explain`: Explanation of why the answer is correct
- `tags`: Optional array of category tags

## 🔧 Development

### Local Development Setup

```bash
# Install dependencies (if any)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### Code Style

- **JavaScript**: ES6+ with modern practices
- **CSS**: CSS Custom Properties, BEM methodology
- **HTML**: Semantic HTML5 with ARIA labels
- **Accessibility**: WCAG 2.1 AA compliance

### Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🚀 Deployment

### Production Deployment

1. **Build Docker Image**:
   ```bash
   docker build -t terraform-quiz:latest .
   ```

2. **Deploy with Docker Compose**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Environment Variables**:
   ```bash
   export NODE_ENV=production
   export NGINX_ENV=production
   ```

### Nginx Configuration

The included `nginx.conf` provides:
- Security headers
- Gzip compression
- Static asset caching
- Rate limiting
- Error handling

## 🔒 Security Features

- **Security Headers**: XSS protection, content type options
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Non-root Execution**: Container runs as non-privileged user
- **Input Validation**: Client and server-side validation
- **CORS Protection**: Restricted to same-origin requests

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-first approach**
- **Flexible grid layouts**
- **Touch-friendly controls**
- **Optimized typography**
- **Adaptive spacing**

## ♿ Accessibility

- **WCAG 2.1 AA compliant**
- **Screen reader support**
- **Keyboard navigation**
- **High contrast mode**
- **Reduced motion support**
- **Semantic HTML structure**

## 🧪 Testing

### Manual Testing Checklist

- [ ] Quiz functionality across different question counts
- [ ] Responsive design on various screen sizes
- [ ] Accessibility with screen readers
- [ ] File upload and validation
- [ ] Export functionality
- [ ] Timer accuracy
- [ ] Progress tracking
- [ ] Error handling

### Automated Testing

```bash
# Run linting
npm run lint

# Run tests
npm test

# Check accessibility
npm run a11y
```

## 🐛 Troubleshooting

### Common Issues

1. **Questions Not Loading**:
   - Check if `questions.json` exists
   - Verify JSON format is valid
   - Check browser console for errors

2. **Docker Issues**:
   - Ensure Docker is running
   - Check port 8080 is available
   - Verify Docker Compose version

3. **Performance Issues**:
   - Clear browser cache
   - Check network connectivity
   - Monitor resource usage

### Debug Mode

Enable debug logging by setting:
```bash
export DEBUG=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines

- Follow existing code style
- Add appropriate comments
- Update documentation
- Test thoroughly
- Consider accessibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Terraform community for inspiration
- Contributors and testers
- Open source community

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Core quiz functionality
- Responsive design
- Docker support
- Accessibility features

---

**Happy Learning! 🎓**

For more information about Terraform Associate certification, visit the [official HashiCorp website](https://www.hashicorp.com/certification/terraform-associate).
