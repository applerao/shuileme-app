/**
 * 睡了么 App - API 性能基准测试
 * 
 * 使用 k6 或自定义脚本进行 API 性能测试
 * 运行：node tests/performance/api-benchmark.js
 */

const https = require('https');
const { performance } = require('perf_hooks');

// 配置
const CONFIG = {
  baseUrl: process.env.API_BASE_URL || 'https://api.shuileme.com',
  concurrentUsers: parseInt(process.env.CONCURRENT_USERS) || 100,
  requestCount: parseInt(process.env.REQUEST_COUNT) || 1000,
  timeout: parseInt(process.env.TIMEOUT_MS) || 5000,
};

// 测试结果统计
class PerformanceStats {
  constructor() {
    this.responseTimes = [];
    this.errors = 0;
    this.successes = 0;
    this.startTime = null;
    this.endTime = null;
  }

  recordResponse(timeMs, success) {
    this.responseTimes.push(timeMs);
    if (success) {
      this.successes++;
    } else {
      this.errors++;
    }
  }

  getStats() {
    if (this.responseTimes.length === 0) {
      return null;
    }

    const sorted = [...this.responseTimes].sort((a, b) => a - b);
    const total = this.responseTimes.length;
    
    return {
      count: total,
      successes: this.successes,
      errors: this.errors,
      errorRate: ((this.errors / total) * 100).toFixed(2) + '%',
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: (this.responseTimes.reduce((a, b) => a + b, 0) / total).toFixed(2),
      p50: sorted[Math.floor(total * 0.50)],
      p90: sorted[Math.floor(total * 0.90)],
      p95: sorted[Math.floor(total * 0.95)],
      p99: sorted[Math.floor(total * 0.99)],
      duration: (this.endTime - this.startTime) + 'ms',
      tps: (total / ((this.endTime - this.startTime) / 1000)).toFixed(2),
    };
  }
}

// HTTP 请求封装
function makeRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    
    const url = new URL(endpoint, CONFIG.baseUrl);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ShuiLeMe-PerformanceTest/1.0',
      },
      timeout: CONFIG.timeout,
    };

    if (data) {
      const body = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(body);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        const success = res.statusCode >= 200 && res.statusCode < 300;
        
        resolve({
          success,
          statusCode: res.statusCode,
          duration,
          data: responseData,
        });
      });
    });

    req.on('error', (error) => {
      const endTime = performance.now();
      reject({
        success: false,
        error: error.message,
        duration: endTime - startTime,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      const endTime = performance.now();
      reject({
        success: false,
        error: 'Request timeout',
        duration: endTime - startTime,
      });
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// 并发执行请求
async function runConcurrentRequests(endpoint, method, data, count, concurrency) {
  const stats = new PerformanceStats();
  stats.startTime = performance.now();
  
  const batches = Math.ceil(count / concurrency);
  
  for (let batch = 0; batch < batches; batch++) {
    const promises = [];
    const batchSize = Math.min(concurrency, count - batch * concurrency);
    
    for (let i = 0; i < batchSize; i++) {
      promises.push(
        makeRequest(endpoint, method, data)
          .then(result => {
            stats.recordResponse(result.duration, result.success);
          })
          .catch(error => {
            stats.recordResponse(error.duration, false);
          })
      );
    }
    
    await Promise.all(promises);
    
    // 进度报告
    const completed = (batch + 1) * batchSize;
    console.log(`  进度：${completed}/${count} (${((completed / count) * 100).toFixed(1)}%)`);
  }
  
  stats.endTime = performance.now();
  return stats;
}

// 测试场景定义
const testScenarios = [
  {
    name: '登录 API',
    endpoint: '/api/v1/auth/login',
    method: 'POST',
    data: { phone: '13800138000', password: 'Test@123456' },
    target: 200, // ms
  },
  {
    name: '注册 API',
    endpoint: '/api/v1/auth/register',
    method: 'POST',
    data: { phone: '13800138001', code: '123456', password: 'Test@123456' },
    target: 200,
  },
  {
    name: '睡前打卡 API',
    endpoint: '/api/v1/checkin/bedtime',
    method: 'POST',
    data: { userId: 'user_123', timestamp: Date.now() },
    target: 200,
  },
  {
    name: '起床打卡 API',
    endpoint: '/api/v1/checkin/wakeup',
    method: 'POST',
    data: { userId: 'user_123', timestamp: Date.now() },
    target: 200,
  },
  {
    name: '查询打卡记录 API',
    endpoint: '/api/v1/checkin/records?userId=user_123&days=30',
    method: 'GET',
    data: null,
    target: 200,
  },
  {
    name: '睡眠评分 API',
    endpoint: '/api/v1/sleep/score?userId=user_123&date=2026-03-07',
    method: 'GET',
    data: null,
    target: 200,
  },
];

// 运行性能测试
async function runPerformanceTest() {
  console.log('='.repeat(60));
  console.log('睡了么 App - API 性能基准测试');
  console.log('='.repeat(60));
  console.log(`\n配置:`);
  console.log(`  API 地址：${CONFIG.baseUrl}`);
  console.log(`  并发用户数：${CONFIG.concurrentUsers}`);
  console.log(`  请求总数：${CONFIG.requestCount}`);
  console.log(`  超时时间：${CONFIG.timeout}ms`);
  console.log('\n');

  const allResults = [];

  for (const scenario of testScenarios) {
    console.log(`测试：${scenario.name}`);
    console.log(`  端点：${scenario.method} ${scenario.endpoint}`);
    console.log(`  目标响应时间：< ${scenario.target}ms`);
    
    try {
      const stats = await runConcurrentRequests(
        scenario.endpoint,
        scenario.method,
        scenario.data,
        CONFIG.requestCount,
        CONFIG.concurrentUsers
      );

      const result = {
        name: scenario.name,
        stats: stats.getStats(),
        target: scenario.target,
        passed: parseFloat(stats.getStats().avg) < scenario.target,
      };

      allResults.push(result);

      // 打印结果
      const s = result.stats;
      console.log(`\n  结果:`);
      console.log(`    总请求数：${s.count}`);
      console.log(`    成功/失败：${s.successes}/${s.errors} (${s.errorRate})`);
      console.log(`    响应时间 (ms):`);
      console.log(`      平均：${s.avg} (目标：<${scenario.target}ms) ${result.passed ? '✓' : '✗'}`);
      console.log(`      P50: ${s.p50}`);
      console.log(`      P90: ${s.p90}`);
      console.log(`      P95: ${s.p95}`);
      console.log(`      P99: ${s.p99}`);
      console.log(`      最小：${s.min}`);
      console.log(`      最大：${s.max}`);
      console.log(`    TPS: ${s.tps}`);
      console.log(`    总耗时：${s.duration}`);
      
    } catch (error) {
      console.log(`  测试失败：${error.message}`);
      allResults.push({
        name: scenario.name,
        error: error.message,
        passed: false,
      });
    }

    console.log('\n' + '-'.repeat(60) + '\n');
  }

  // 汇总报告
  console.log('='.repeat(60));
  console.log('性能测试汇总报告');
  console.log('='.repeat(60));
  
  const passedTests = allResults.filter(r => r.passed).length;
  const totalTests = allResults.length;
  
  console.log(`\n测试通过率：${passedTests}/${totalTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`);
  
  console.log('\n详细结果:');
  console.log('-'.repeat(60));
  
  for (const result of allResults) {
    const status = result.passed ? '✓ 通过' : '✗ 失败';
    const avgTime = result.stats ? result.stats.avg : 'N/A';
    console.log(`  ${result.name}: ${status} (平均：${avgTime}ms)`);
  }

  console.log('\n' + '='.repeat(60));
  
  // 返回结果用于 CI/CD
  const exitCode = passedTests === totalTests ? 0 : 1;
  process.exit(exitCode);
}

// 运行测试
if (require.main === module) {
  runPerformanceTest().catch(error => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });
}

module.exports = { runPerformanceTest, PerformanceStats, makeRequest };
