pipeline {
    agent any

    stages {

        // -----------------------------
        stage('Build') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                sh '''
                    echo "Listing workspace before build:"
                    ls -la
                    node --version
                    npm --version
                    npm ci
                    npm run build
                    echo "Build output:"
                    ls -la build
                '''
            }
        }

        // -----------------------------
        stage('Tests') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                sh '''
                    echo "Running tests in CI mode..."
                    npm test
                '''
            }
            post {
                always {
                    // Archive JUnit results
                    junit 'test-results/*.xml'
                }
            }
        }

        // -----------------------------
        stage('E2E') {
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.39.0-jammy'
                    reuseNode true
                }
            }
            steps {
                sh '''
                    npm install serve
                    # Serve the build folder
                    npx serve -s build & 
                    SERVER_PID=$!
                    sleep 10
                    # Run Playwright tests with HTML report
                    npx playwright test --reporter=html
                    kill $SERVER_PID
                '''
            }
            post {
                always {
                    // Publish Playwright HTML report
                    publishHTML([
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright E2E Report',
                        allowMissing: false,
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                }
            }
        }

        // -----------------------------
        stage('Deploy') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                sh '''
                   npx install netlify-cli -g
                   netlify --version
                   # Uncomment below to deploy automatically
                   # netlify deploy --prod --dir=build --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID
                '''
            }
        }
    }
}
