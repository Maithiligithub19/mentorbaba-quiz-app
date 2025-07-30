import pandas as pd

# Sample questions on Flask and AWS
questions_data = {
    'Question': [
        'What is the default port number for Flask development server?',
        'Which AWS service is used for serverless computing?',
        'What decorator is used to define a route in Flask?',
        'Which AWS service provides scalable object storage?',
        'What method is used to get form data in Flask?'
    ],
    'Option_A': [
        '5000',
        'EC2',
        '@route',
        'RDS',
        'request.form'
    ],
    'Option_B': [
        '8000',
        'Lambda',
        '@app.route',
        'S3',
        'request.get'
    ],
    'Option_C': [
        '3000',
        'ECS',
        '@flask.route',
        'DynamoDB',
        'request.data'
    ],
    'Option_D': [
        '80',
        'Fargate',
        '@web.route',
        'CloudFront',
        'request.json'
    ],
    'Correct_Ans': [
        'A',
        'B',
        'B',
        'B',
        'A'
    ]
}

# Create DataFrame and save to Excel
df = pd.DataFrame(questions_data)
df.to_excel('flask_aws_questions.xlsx', index=False)
print("Sample questions file created: flask_aws_questions.xlsx")