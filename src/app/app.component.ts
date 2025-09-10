import { Component, OnInit } from '@angular/core';
import { BranchRef, GithubService, Repo } from './services/github-services';
import {GeminiApiService} from './services/gemini-service';
import { AiService, JavaFilePayload } from './services/ai-service';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface   BranchPrompt {
  branch: string;
  prompt: string;
  filesCount: number;
  generatedAt: string;
  result?: string;   
  running?: boolean; 
}

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'EvalusenseIA';

  get currentYear(): number {
    return new Date().getFullYear();
  }

  // UI State
  username = 'clavison';
  token = '';
  tokenG = '';
  repos: Repo[] = [];
  reposLoading = false;

  selectedRepo: string | null = null;
  branches: BranchRef[] = [];
  branchesLoading = false;

  // Campos do professor (opcionais)
  avaliacao = '';
  criterios = '';
  exemploSaida = '';
  avaliacaoModelo = '';

  usarBase64 = false; // recomendação padrão: false (texto decodificado)

  // Prompts por branch (em memória)
  prompts: BranchPrompt[] = [];

  // Mensagens
  message = '';
  error = '';

  constructor(private gh: GithubService, private ai: AiService, private gemini: GeminiApiService) { }

  ngOnInit(): void {
    this.loadRepos();
  }

  async loadRepos() {
    this.error = '';
    this.message = '';
    this.reposLoading = true;
    try {
      this.gh.setUsername(this.username);
      this.gh.setToken(this.token);
      const repos = await firstValueFrom(this.gh.getUserRepos());
      // ordena por nome localmente (case-insensitive)
      this.repos = [...repos].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
    } catch (e: any) {
      this.error = 'Erro ao carregar repositórios. Verifique o usuário/token e a taxa de limite do GitHub.';
      console.error(e);
    } finally {
      this.reposLoading = false;
    }
  }

 onRepoChange(event: Event) {
  const select = event.target as HTMLSelectElement;
  const repoName = select.value;
  this.selectedRepo = repoName;
  console.log('Repositório selecionado:', repoName);
  console.log(this.selectedRepo);
  console.log(this.branchesLoading);
  //this.loadBranches(repoName);
}

  private localStorageKey(repo: string) {
    return `evalusense.prompts.${this.username}.${repo}`;
  }

  private savePrompts(repo: string) {
    localStorage.setItem(this.localStorageKey(repo), JSON.stringify(this.prompts));
  }

  private loadPromptsFromStorage(repo: string) {
    const raw = localStorage.getItem(this.localStorageKey(repo));
    this.prompts = raw ? JSON.parse(raw) : [];
  }

  async loadBranches(repo: string) {
    this.error = '';
    this.message = 'Carregando branches e gerando prompts... (isso pode levar alguns segundos, dependendo do tamanho)';
    this.branchesLoading = true;
    try {
      this.gh.setUsername(this.username);
      this.gh.setToken(this.token);

      // Carrega/mostra prompts já salvos
      this.loadPromptsFromStorage(repo);

      const branches = await firstValueFrom(this.gh.getBranches(repo));
      // Remove 'main' (case-insensitive)
      const filtered = branches.filter(b => b.name.toLowerCase() !== 'main');
      // Ordena alfabeticamente
      this.branches = filtered.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));

      // Para evitar rate limit, processa branch por branch de forma sequencial
      for (const br of this.branches) {
        await this.buildPromptForBranch(repo, br.name);
      }

      this.message = 'Prompts gerados. Você pode revisar/editar cada um abaixo.';
      this.savePrompts(repo);
    } catch (e: any) {
      this.error = 'Falha ao carregar branches/arquivos. Talvez o limite da API do GitHub tenha sido atingido. Tente informar um token.';
      console.error(e);
    } finally {
      this.branchesLoading = false;
    }
  }

  // Decodifica base64 retornado pela API
  private decodeBase64(b64: string): string {
    try {
      // A API do GitHub pode trazer quebras de linha no base64; removemos
      const clean = b64.replace(/\n/g, '');
      // Decodificação robusta (browser)
      return decodeURIComponent(escape(atob(clean)));
    } catch {
      // Fallback simples
      return atob(b64.replace(/\n/g, ''));
    }
  }

  private upsertPrompt(branch: string, prompt: string, filesCount: number) {
    const idx = this.prompts.findIndex(p => p.branch === branch);
    const entry: BranchPrompt = {
      branch,
      prompt,
      filesCount,
      generatedAt: new Date().toISOString()
    };
    if (idx >= 0) this.prompts[idx] = entry;
    else this.prompts.push(entry);
  }

  async rebuildAll() {
    if (!this.selectedRepo) return;
    this.prompts = [];
    await this.loadBranches(this.selectedRepo);
  }

  async buildPromptForBranch(repo: string, branch: string) {
    try {
      const br = await firstValueFrom(this.gh.getBranch(repo, branch));
      const tree = await firstValueFrom(this.gh.getTree(repo, br.commit.sha));
      const javaFiles = (tree.tree || []).filter(n => n.type === 'blob' && /\.java$/i.test(n.path));

      const payloads: JavaFilePayload[] = [];
      for (const node of javaFiles) {
        const contentResp = await firstValueFrom(this.gh.getFileContent(repo, node.path, branch));
        const base64 = contentResp.content;
        const decoded = this.decodeBase64(base64);
        payloads.push({ fileName: node.path.split('/').pop() || node.path, decoded, base64 });
      }

      const prompt = this.ai.buildPrompt({
        repo,
        branch,
        files: payloads,
        avaliacao: this.avaliacao || undefined,
        criterios: this.criterios || undefined,
        exemploSaida: this.exemploSaida || undefined,
        avaliacaoModelo: this.avaliacaoModelo || undefined,
        usarBase64: this.usarBase64
      });

      this.upsertPrompt(branch, prompt, payloads.length);
    } catch (e) {
      console.error(`Erro ao criar prompt para ${branch}`, e);
    }
  }

  copy(text: string) {
    navigator.clipboard.writeText(text);
    this.message = 'Prompt copiado para a área de transferência.';
    setTimeout(() => (this.message = ''), 2500);
  }

  async  executar(p: BranchPrompt) {
    this.error = '';
    if (!this.tokenG || this.tokenG.trim() === '') {
      this.error = 'É necessário informar o Token Gemini para executar o prompt.';
      return;
    }

    this.gemini.initialize(this.tokenG);

    try {
      p.running = true;
      p.result = undefined;
      const resposta = await firstValueFrom(
        this.gemini.generateContent(p.prompt)
      );
     if(resposta){
      let clean = resposta.trim();
      if (clean.startsWith('```')) {
        clean = clean.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
      }
       try {
         const parsed = JSON.parse(resposta);
         p.result = JSON.stringify(parsed, null, 2);
       } catch {
         p.result = resposta; 
       }
     }else{
      p.result = 'Nenhum resultado retornado.';
     }
    } catch (e) {
      console.error('Erro ao executar prompt', e);
      this.error = 'Falha ao executar o prompt. Verifique o token e tente novamente.';
    } finally {
      p.running = false;
    }
  }
}
