# Enhanced Question Format Documentation

## Overview

The Terraform Practice Test application now supports an enhanced question format that includes multiple answers, difficulty levels, exam focus points, and categories. This format is designed to be backward compatible while providing rich metadata for better exam preparation.

## New Question Structure

### Basic Fields

```json
{
  "id": "q001",                    // Unique identifier for the question
  "q": "Question text here?",      // The actual question
  "choices": ["A", "B", "C", "D"], // Array of answer choices
  "answer": [1],                   // Array of correct answer indices (0-based)
  "explain": "Explanation text",   // Explanation of the correct answer
  "tags": ["tag1", "tag2"],       // Array of topic tags
  "difficulty": "medium",          // Difficulty level: easy, medium, hard
  "focus": "1.1",                 // Exam focus point (1.1 to 9.5)
  "category": "Category Name",    // Question category
  "multiple": false               // Whether multiple answers are allowed
}
```

### Field Descriptions

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | string | Yes | Unique identifier for the question | `"q001"` |
| `q` | string | Yes | The question text | `"What does terraform init do?"` |
| `choices` | array | Yes | Array of answer choices | `["A", "B", "C", "D"]` |
| `answer` | array | Yes | Array of correct answer indices | `[1]` or `[0, 2]` |
| `explain` | string | No | Explanation of the correct answer | `"terraform init initializes..."` |
| `tags` | array | No | Array of topic tags | `["workflow", "basics"]` |
| `difficulty` | string | No | Difficulty level | `"easy"`, `"medium"`, `"hard"` |
| `focus` | string | No | Exam focus point | `"1.1"`, `"5.4"`, `"9.2"` |
| `category` | string | No | Question category | `"Terraform Basics"` |
| `multiple` | boolean | No | Multiple choice flag | `true` or `false` |

## Difficulty Levels

Three difficulty levels are supported:

- **`easy`** - Basic concepts, fundamental knowledge
- **`medium`** - Intermediate concepts, practical application
- **`hard`** - Advanced concepts, complex scenarios

## Exam Focus Points

The focus points follow the official Terraform Associate exam structure:

- **Domain 1: Terraform Basics** (1.1 - 1.5)
- **Domain 2: Variables and Inputs** (2.1 - 2.5)
- **Domain 3: Resource Management** (3.1 - 3.5)
- **Domain 4: Provider Management** (4.1 - 4.5)
- **Domain 5: Data Sources** (5.1 - 5.5)
- **Domain 6: Workspace Management** (6.1 - 6.5)
- **Domain 7: CI/CD Integration** (7.1 - 7.5)
- **Domain 8: Security and Compliance** (8.1 - 8.5)
- **Domain 9: Advanced Concepts** (9.1 - 9.5)

## Question Types

### Single Answer Questions

For questions with only one correct answer:

```json
{
  "id": "q001",
  "q": "Which command initializes Terraform?",
  "choices": [
    "terraform plan",
    "terraform init",
    "terraform apply",
    "terraform destroy"
  ],
  "answer": [1],
  "explain": "terraform init initializes the working directory",
  "difficulty": "easy",
  "focus": "1.1",
  "category": "Terraform Basics",
  "multiple": false
}
```

### Multiple Answer Questions

For questions with multiple correct answers:

```json
{
  "id": "q002",
  "q": "Which of the following are valid Terraform data sources? (Select all that apply)",
  "choices": [
    "aws_instance",
    "data.aws_ami",
    "local_file",
    "data.aws_vpc"
  ],
  "answer": [1, 3],
  "explain": "Data sources start with 'data.' prefix",
  "difficulty": "medium",
  "focus": "5.1",
  "category": "Data Sources",
  "multiple": true
}
```

## Backward Compatibility

The application automatically normalizes old question formats:

### Old Format (Still Supported)
```json
{
  "q": "Question text?",
  "choices": ["A", "B", "C", "D"],
  "answer": 1,
  "explain": "Explanation",
  "tags": ["tag1"]
}
```

### Automatically Converted To
```json
{
  "id": "q123abc456",
  "q": "Question text?",
  "choices": ["A", "B", "C", "D"],
  "answer": [1],
  "explain": "Explanation",
  "tags": ["tag1"],
  "difficulty": "medium",
  "focus": "1.1",
  "category": "General",
  "multiple": false
}
```

## Creating Custom Questions

### Step 1: Prepare Your Questions

Create a JSON file with your questions following the new format:

```json
[
  {
    "id": "custom_001",
    "q": "Your custom question here?",
    "choices": [
      "Choice A",
      "Choice B",
      "Choice C",
      "Choice D"
    ],
    "answer": [0],
    "explain": "Your explanation here",
    "tags": ["custom", "your-topic"],
    "difficulty": "medium",
    "focus": "2.1",
    "category": "Your Category",
    "multiple": false
  }
]
```

### Step 2: Upload Questions

1. Click the "Load questions" button in the application
2. Select your JSON file
3. The application will validate and load your questions
4. Your questions will replace the existing question bank

### Step 3: Export Questions

Use the "Export questions" button to download the current question set, including any custom questions you've added.

## Validation Rules

The application validates questions according to these rules:

1. **Required Fields**: `id`, `q`, `choices`, `answer`
2. **Answer Validation**: Answer indices must be valid choice indices
3. **Multiple Choice**: If `answer` array has more than one element, `multiple` is automatically set to `true`
4. **Choice Count**: Must have at least 2 choices
5. **Answer Range**: Answer indices must be within the range of available choices

## Example Question Bank

Here's a complete example with various question types:

```json
[
  {
    "id": "q001",
    "q": "What does terraform init do?",
    "choices": [
      "Creates resources",
      "Initializes working directory",
      "Destroys resources",
      "Shows execution plan"
    ],
    "answer": [1],
    "explain": "terraform init initializes the working directory and downloads required providers",
    "tags": ["workflow", "basics"],
    "difficulty": "easy",
    "focus": "1.1",
    "category": "Terraform Basics"
  },
  {
    "id": "q002",
    "q": "Which of the following are valid variable types? (Select all that apply)",
    "choices": [
      "string",
      "number",
      "boolean",
      "list"
    ],
    "answer": [0, 1, 2, 3],
    "explain": "All of these are valid Terraform variable types",
    "tags": ["variables", "types"],
    "difficulty": "medium",
    "focus": "2.2",
    "category": "Variables and Inputs",
    "multiple": true
  },
  {
    "id": "q003",
    "q": "How do you reference a module output?",
    "choices": [
      "module.name.output",
      "output.module.name",
      "var.module.output",
      "module.output.name"
    ],
    "answer": [0],
    "explain": "Module outputs are referenced using module.name.output syntax",
    "tags": ["modules", "outputs"],
    "difficulty": "hard",
    "focus": "3.3",
    "category": "Module Management"
  }
]
```

## Best Practices

### Question Writing

1. **Clear and Concise**: Write questions that are easy to understand
2. **Realistic Scenarios**: Use practical, real-world examples
3. **Proper Difficulty**: Assign appropriate difficulty levels
4. **Accurate Focus Points**: Use correct exam domain focus points
5. **Helpful Explanations**: Provide clear explanations for learning

### Answer Choices

1. **Plausible Distractors**: All choices should be reasonable
2. **No "All of the Above"**: Avoid vague or confusing choices
3. **Consistent Formatting**: Keep choices similar in length and style
4. **Logical Order**: Arrange choices in logical sequence when possible

### Metadata

1. **Accurate Tags**: Use relevant and specific tags
2. **Proper Categories**: Group questions logically
3. **Correct Focus Points**: Match official exam structure
4. **Realistic Difficulty**: Assess difficulty objectively

## Troubleshooting

### Common Issues

1. **Invalid JSON**: Ensure your JSON file is properly formatted
2. **Missing Required Fields**: Check that all required fields are present
3. **Invalid Answer Indices**: Answer indices must be within choice range
4. **File Size**: Keep files under 5MB for upload

### Validation Errors

The application will show specific error messages for:
- Malformed JSON
- Missing required fields
- Invalid answer indices
- File size limits

## Advanced Features

### Question Filtering

Future versions will support:
- Filtering by difficulty level
- Filtering by focus point
- Filtering by category
- Filtering by tags

### Exam Generation

Future versions will support:
- Creating exams with specific focus point coverage
- Difficulty-balanced exams
- Category-specific exams
- Custom exam lengths

## Support

For questions about the question format or help creating custom questions:

1. Check the application's built-in help
2. Review the validation error messages
3. Use the export feature to see working examples
4. Test with small question sets first

---

**Note**: This enhanced format maintains full backward compatibility while providing rich metadata for better exam preparation and question management.
