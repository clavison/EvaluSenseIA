import { Injectable } from '@angular/core';

export interface JavaFilePayload {
    fileName: string;
    decoded: string;
    base64: string;
}

export interface PromptInput {
    repo: string;
    branch: string;
    files: JavaFilePayload[];
    avaliacao?: string;
    criterios?: string;
    exemploSaida?: string;
    avaliacaoModelo?: string;
    usarBase64?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AiService {
    /**
     * Gera o prompt final em texto plano.
     * Se usarBase64=true, inclui conteúdo em base64; caso contrário, inclui decodificado.
     */
    buildPrompt(input: PromptInput): string {
        const header =
            `[EvalusenseIA]
ALUNO (branch): ${input.branch}
REPOSITÓRIO: ${input.repo}

Instruções do professor (opcionais):
- Avaliação: ${input.avaliacao || '(não informado)'}
- Critérios: ${input.criterios || '(não informado)'}
- Exemplo de saída: ${input.exemploSaida || '(não informado)'}
- Avaliação modelo: ${input.avaliacaoModelo || '(não informado)'}
`;

        const filesBlock = input.files.map(f =>
            `### ARQUIVO: ${f.fileName}
${input.usarBase64 ? '(conteúdo em base64)' : '(conteúdo em texto)'}
----------------------------------------
${input.usarBase64 ? f.base64 : f.decoded}
----------------------------------------`).join('\n\n');

        const tail =
            `
Tarefa da IA:
1) Avalie o código do ALUNO (branch ${input.branch}) conforme os CRITÉRIOS e, se fornecida, a AVALIAÇÃO MODELO.
2) Responda no seguinte formato:
{
  "branch": "${input.branch}",
  "nota": "<0..10>",
  "feedback": "<texto objetivo>",
  "observacoes": "<opcional>"
}
`;

        return `${header}\n${filesBlock}\n${tail}`;
    }
}
