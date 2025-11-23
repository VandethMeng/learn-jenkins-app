pipeline {
    agent any

    environment {
        NETLIFY_SITE_ID = '977243c1-0b34-4eb0-a2a3-477e2c0d680d'
        // Use Jenkins Secret Text credential ID for Netlify token
        NETLIFY_AUTH_TOKEN = credentials('netlify-token')
    }

    stages {
        // -----------------------------
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // -----------------------------
        stage('Build') {
            steps {
                sh '''
                    echo "Listing workspace before build:"
                    ls -la

                    node --version
                    npm --version

                    # Install dependencies
                    npm ci

                    # Build React app
                    npm run build

                    echo "Build output:"
                    ls -la build
                '''
            }
            post {
                always {
                    archiveArtifacts artifacts: 'build/**', allowEmptyArchive: true
                }
            }
        }

        // -----------------------------
        stage('Unit Tests') {
            steps {
                sh '''
                    echo "Running Jest tests in CI mode..."
                    npm test
                '''
            }
            post {
                always {
                    junit 'test-results/**/*.xml'
                }
            }
        }

        // -----------------------------
        stage('E2E Tests') {
            steps {
                sh '''
                    echo "Starting static server locally in background..."
                    npx serve -s build -l 3000 &
                    SERVER_PID=$!

                    echo "Waiting for server to be ready..."
                    sleep 5

                    echo "Installing Playwright browsers..."
                    npx playwright install

                    echo "Running Playwright E2E tests..."
                    npx playwright test --reporter=html

                    echo "Stopping static server..."
                    kill $SERVER_PID || true
                '''
            }
            post {
                always {
                    publishHTML(target: [
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright E2E Report',
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                }
            }
        }

        // -----------------------------
        stage('Deploy staging') {
            when {
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                sh '''
                    echo "Deploying to Netlify staging..."
                    npx netlify deploy --dir=build --site=$NETLIFY_SITE_ID --auth=$NETLIFY_AUTH_TOKEN
                '''
            }
        }

           stage('Deploy prod') {
            when {
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                sh '''
                    echo "Deploying to Netlify..."
                    npx netlify deploy --prod --dir=build --site=$NETLIFY_SITE_ID --auth=$NETLIFY_AUTH_TOKEN
                '''
            }
        }
    }

    post {
        always {
            echo "Pipeline finished."
        }
        success {
            echo "Pipeline succeeded!"
        }
        failure {
            echo "Pipeline failed!"
        }
    }
}
