pipeline {
    agent any

    environment {
        NETLIFY_SITE_ID = '977243c1-0b34-4eb0-a2a3-477e2c0d680d'
        NETLIFY_AUTH_TOKEN = credentials('netlify-token')
    }

    stages {

        // -----------------------------
        stage('Build') {
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
            steps {
                sh '''
                    npm install serve
                    npx serve -s build & SERVER_PID=$!
                    sleep 10
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
        stage('Prod E2E') {
            environment {
                CI_ENVIRONMENT_URL = 'https://precious-nougat-12f2bf.netlify.app'
            }
            steps {
                sh '''
                    npx playwright test --reporter=html
                '''
            }
            post {
                always {
                    publishHTML([
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright production E2E Report',
                        allowMissing: false,
                        keepAll: true,
                        alwaysLinkToLastBuild: true
                    ])
                }
            }
        }

        // -----------------------------
        stage('Deploy') {
            steps {
                withCredentials([string(credentialsId: 'netlify-token', variable: 'NETLIFY_AUTH_TOKEN')]) {
                    sh '''
                        echo "Deploying to Netlify..."
                        npm install -g netlify-cli
                        npx netlify --version

                        echo "Deploying to production, site ID: $NETLIFY_SITE_ID"
                        npx netlify deploy --prod --dir=build \
                            --auth=$NETLIFY_AUTH_TOKEN \
                            --site=$NETLIFY_SITE_ID \
                            --no-build
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
