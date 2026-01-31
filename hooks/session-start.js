#!/usr/bin/env node
/**
 * DTZ Handoff - SessionStart Hook
 * 새 세션 시작 시 이전 handoff 파일 감지 및 안내
 */

const fs = require('fs');
const path = require('path');

// stdin에서 JSON 읽기 (Claude Code 표준)
async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

// Handoff 파일 파싱
function parseHandoff(content) {
  const result = {
    sessionId: null,
    created: null,
    contextSummary: null,
    pendingTasks: [],
    nextSteps: []
  };

  // Session ID 추출
  const sessionMatch = content.match(/Session ID\s*\|\s*`([^`]+)`/);
  if (sessionMatch) result.sessionId = sessionMatch[1];

  // Created 추출
  const createdMatch = content.match(/Created\s*\|\s*`([^`]+)`/);
  if (createdMatch) result.created = createdMatch[1];

  // Context Summary 추출
  const contextMatch = content.match(/## Context Summary\n([\s\S]*?)(?=\n##|$)/);
  if (contextMatch) result.contextSummary = contextMatch[1].trim();

  // Pending Tasks 추출
  const pendingMatch = content.match(/## Pending Tasks\n([\s\S]*?)(?=\n##|$)/);
  if (pendingMatch) {
    const tasks = pendingMatch[1].match(/- \[ \] .+/g);
    if (tasks) result.pendingTasks = tasks.map(t => t.replace('- [ ] ', ''));
  }

  // Next Steps 추출
  const nextStepsMatch = content.match(/## Next Steps\n([\s\S]*?)(?=\n##|---|\n\*Generated|$)/);
  if (nextStepsMatch) {
    const steps = nextStepsMatch[1].match(/\d+\.\s+.+/g);
    if (steps) result.nextSteps = steps.map(s => s.replace(/^\d+\.\s+/, ''));
  }

  return result;
}

async function main() {
  try {
    // stdin에서 세션 정보 읽기
    const input = await readStdin();
    let data = {};
    try { data = JSON.parse(input); } catch {}

    const directory = data.directory || process.cwd();
    const handoffPath = path.join(directory, '.dtz', 'handoffs', 'latest.md');

    // Handoff 파일 확인
    if (!fs.existsSync(handoffPath)) {
      // 파일 없음 - 정상 세션 시작, 아무것도 출력하지 않음
      return;
    }

    // 파일 읽기 및 파싱
    const content = fs.readFileSync(handoffPath, 'utf-8');
    const handoff = parseHandoff(content);

    // 유효성 검사
    if (!handoff.sessionId) {
      console.log(`<system-reminder>
[DTZ Handoff] 파일 파싱 오류: ${handoffPath}
</system-reminder>`);
      return;
    }

    // additionalContext: Claude에게 전달되는 상세 컨텍스트
    let additionalContext = `[DTZ Handoff] 이전 세션 자동 로드

Session: ${handoff.sessionId}
생성: ${handoff.created || 'Unknown'}

## Context
${handoff.contextSummary || '(요약 없음)'}

`;

    if (handoff.pendingTasks.length > 0) {
      additionalContext += `## Pending Tasks\n`;
      handoff.pendingTasks.forEach((task, i) => {
        additionalContext += `${i + 1}. ${task}\n`;
      });
      additionalContext += `
**ACTION REQUIRED**: 위 Pending Tasks를 TaskCreate 도구로 TODO 항목으로 생성하세요.
`;
    }

    additionalContext += `---
Handoff 파일: ${handoffPath}`;

    // systemMessage: 사용자에게 CLI에 표시되는 메시지 (상세 버전)
    let systemMessage = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 이전 세션 발견: ${handoff.sessionId}
   생성: ${handoff.created || 'Unknown'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Context Summary:
${handoff.contextSummary || '(요약 없음)'}
`;

    if (handoff.pendingTasks.length > 0) {
      systemMessage += `
⏳ Pending Tasks (${handoff.pendingTasks.length}개):`;
      handoff.pendingTasks.forEach((task, i) => {
        systemMessage += `
   ${i + 1}. ${task}`;
      });
    }

    if (handoff.nextSteps.length > 0) {
      systemMessage += `

🚀 Next Steps:`;
      handoff.nextSteps.forEach((step, i) => {
        systemMessage += `
   ${i + 1}. ${step}`;
      });
    }

    systemMessage += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 "/dtz:handoff load" 입력하면 TODO가 자동 복원됩니다.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`

    // JSON 형식으로 출력 (additionalContext + systemMessage)
    console.log(JSON.stringify({
      additionalContext,
      systemMessage
    }));

  } catch (error) {
    // 에러 발생 시 무시 (세션 시작 방해하지 않음)
    console.error(`[DTZ Handoff] Error: ${error.message}`);
  }
}

main();
