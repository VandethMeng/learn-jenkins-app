pipeline {
    agent any

    environment {
        NETLIFY_SITE_ID = '977243c1-0b34-4eb0-a2a3-477e2c0d680d'
        // Make sure the Jenkins credential ID matches exactly
        NETLIFY_AUTH_TOKEN = credentials('netify-token')
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
                // Use withCredentials to inject the secret safely
                withCredentials([string(credentialsId: 'netify-token', variable: 'NETLIFY_AUTH_TOKEN')]) {
                    sh '''
                        echo "small change"
                        echo "Deploying to Netlify..."
                        npx netlify --version
                        echo "Deploying to production, site ID: $NETLIFY_SITE_ID"
                        # Deploy without triggering Netlify build (we already built in Jenkins)
                        npx netlify deploy --prod --dir=build --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID --no-build

                    '''
                }
            }
            post {
                success {
                    echo "Deployment stage finished successfully!"
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
