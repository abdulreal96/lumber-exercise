#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const exercisesPath = path.resolve('src/constants/exercises.json');
const exercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf-8'));

const TIMEOUT_MS = 8000;
const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 500;
const RETRYABLE_CODES = new Set([404, 408, 429, 500, 502, 503, 504]);
const REQUEST_GAP_MS = 150;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function checkVideoOnce(videoId) {
  return new Promise(resolve => {
    if (!videoId) {
      resolve({ status: 'missing', detail: 'No videoId set' });
      return;
    }

    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

    const req = https.get(url, res => {
      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ status: 'ok' });
        } else {
          resolve({
            status: 'error',
            code: res.statusCode,
            detail: parseError(data),
          });
        }
      });
    });

    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy(new Error('timeout'));
      resolve({ status: 'error', detail: 'Timed out' });
    });

    req.on('error', err => {
      resolve({ status: 'error', detail: err.message });
    });
  });
}

function annotateAttempts(result, attempt) {
  if (attempt <= 1) return result;
  return {
    ...result,
    detail: result.detail
      ? `${result.detail} (after ${attempt} attempts)`
      : `after ${attempt} attempts`,
  };
}

async function checkVideo(videoId, attempt = 1) {
  const outcome = await checkVideoOnce(videoId);
  if (outcome.status === 'ok') {
    return outcome;
  }

  const canRetry =
    attempt < MAX_ATTEMPTS &&
    (outcome.detail === 'Timed out' || RETRYABLE_CODES.has(outcome.code));

  if (!canRetry) {
    return annotateAttempts(outcome, attempt);
  }

  await delay(RETRY_DELAY_MS * attempt);
  return checkVideo(videoId, attempt + 1);
}

function parseError(body) {
  if (!body) return 'No response body';
  try {
    const parsed = JSON.parse(body);
    return parsed?.error?.message || parsed?.message || body;
  } catch (_err) {
    return body;
  }
}

async function main() {
  const results = [];
  for (let i = 0; i < exercises.length; i += 1) {
    const exercise = exercises[i];
    const { name, videoId } = exercise;
    const outcome = await checkVideo(videoId);
    results.push({
      exercise: name,
      videoId: videoId || '—',
      status: outcome.status,
      code: outcome.code ?? '',
      detail: outcome.detail ?? '',
    });

    if (REQUEST_GAP_MS && i < exercises.length - 1) {
      await delay(REQUEST_GAP_MS);
    }
  }

  console.table(results);

  const invalid = results.filter(r => r.status !== 'ok');
  if (invalid.length) {
    console.log(`\n⚠️  ${invalid.length} video(s) need attention.`);
  } else {
    console.log('\n✅ All exercise videos are embeddable.');
  }
}

main().catch(err => {
  console.error('Failed to run video check:', err);
  process.exit(1);
});
