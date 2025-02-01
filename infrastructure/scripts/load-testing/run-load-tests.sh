#!/bin/bash

# Configuration
TEST_DURATION=${TEST_DURATION:-"5m"}
ENVIRONMENT=${ENVIRONMENT:-"staging"}
OUTPUT_DIR="load-test-results/$(date +%Y%m%d_%H%M%S)"
K6_PROMETHEUS_RW_SERVER_URL=${K6_PROMETHEUS_RW_SERVER_URL:-"http://prometheus:9090/api/v1/write"}

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Function to run a specific test scenario
run_test_scenario() {
    local scenario=$1
    local output_file="$OUTPUT_DIR/${scenario}_results.json"
    
    echo "Running $scenario test scenario..."
    K6_PROMETHEUS_RW_TREND_STATS="p(95),p(99),min,max,avg" \
    k6 run \
        --tag environment="$ENVIRONMENT" \
        --tag scenario="$scenario" \
        --out json="$output_file" \
        --out prometheus-remote \
        --vus "${2:-10}" \
        --duration "${3:-$TEST_DURATION}" \
        k6-test-plan.js
    
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        echo "❌ $scenario test failed with exit code $exit_code"
        return $exit_code
    fi
    echo "✅ $scenario test completed successfully"
}

# Function to generate HTML report
generate_report() {
    echo "Generating HTML report..."
    
    # Combine all JSON results
    jq -s '.' "$OUTPUT_DIR"/*_results.json > "$OUTPUT_DIR/combined_results.json"
    
    # Generate HTML report using template
    cat > "$OUTPUT_DIR/report.html" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Load Test Report - $(date +%Y-%m-%d)</title>
    <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { margin: 20px 0; padding: 20px; border: 1px solid #ddd; }
        .pass { color: green; }
        .fail { color: red; }
    </style>
</head>
<body>
    <h1>Load Test Report</h1>
    <div id="summary"></div>
    <div id="latencyGraph"></div>
    <div id="requestsGraph"></div>
    <div id="errorsGraph"></div>
    <script>
        fetch('combined_results.json')
            .then(response => response.json())
            .then(data => {
                // Process and visualize data
                const summary = document.getElementById('summary');
                const metrics = {
                    'Total Requests': data.metrics.http_reqs.count,
                    'Average Response Time': data.metrics.http_req_duration.avg.toFixed(2) + 'ms',
                    'Error Rate': (data.metrics.errors.rate * 100).toFixed(2) + '%',
                    'Cache Hit Rate': (data.metrics.cache_hit_rate.rate * 100).toFixed(2) + '%'
                };
                
                summary.innerHTML = Object.entries(metrics)
                    .map(([key, value]) => \`<div class="metric">\${key}: \${value}</div>\`)
                    .join('');
                
                // Create graphs
                Plotly.newPlot('latencyGraph', [{
                    y: data.metrics.http_req_duration.values,
                    type: 'box',
                    name: 'Response Time Distribution'
                }], {
                    title: 'Response Time Distribution'
                });
                
                Plotly.newPlot('requestsGraph', [{
                    y: data.metrics.vus.values,
                    type: 'scatter',
                    name: 'Virtual Users'
                }], {
                    title: 'Virtual Users Over Time'
                });
                
                Plotly.newPlot('errorsGraph', [{
                    y: data.metrics.errors.values,
                    type: 'scatter',
                    name: 'Errors'
                }], {
                    title: 'Errors Over Time'
                });
            });
    </script>
</body>
</html>
EOF
    
    echo "📊 Report generated at $OUTPUT_DIR/report.html"
}

# Main execution
echo "🚀 Starting load tests..."

# Run different test scenarios
run_test_scenario "constant_load" 10 "5m"
run_test_scenario "ramp_up" 20 "9m"
run_test_scenario "stress_test" 50 "9m"

# Generate report
generate_report

echo "✨ Load testing completed!"
echo "Results available in: $OUTPUT_DIR" 