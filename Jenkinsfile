pipeline {
    agent any

    environment{
        NETLIFY_SITE_ID = '977243c1-0b34-4eb0-a2a3-477e2c0d680d'
    }

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
            post {
                always {
                    // Archive the React build folder
                    archiveArtifacts artifacts: 'build/**', allowEmptyArchive: true
                }
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
                    echo "Running Jest tests in CI mode..."
                    npm test
                '''
            }
            post {
                always {
                    // Archive JUnit test results
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
                    # Serve the React build folder
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
                   echo "Deploying to Netlify..."
                   # Use npx to avoid global install issues
                   npx netlify --version
                   echo "Deploying to prodcuton, site ID: $NETLIFY_SITE_ID"
                   # Uncomment below to deploy automatically
                   # npx netlify deploy --prod --dir=build --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID
                '''
            }
            post {
                success {
                    echo "Deployment stage finished successfully!"
                    // Optional: archive build folder after deploy
                    archiveArtifacts artifacts: 'build/**', allowEmptyArchive: true
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline finished at ${new Date()}"
        }
        success {
            echo "Pipeline completed successfully!"
        }
        failure {
            echo "Pipeline failed. Check Build, Test, E2E, or Deploy stages for errors."
        }
    }
}
