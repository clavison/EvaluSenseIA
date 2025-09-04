import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Repo {
    name: string;
    full_name: string;
}

export interface BranchRef {
    name: string;
    commit: { sha: string; url: string };
    protected?: boolean;
}

export interface TreeNode {
    path: string;
    mode: string;
    type: 'blob' | 'tree';
    sha: string;
    size?: number;
    url: string;
}

export interface TreeResponse {
    sha: string;
    truncated: boolean;
    tree: TreeNode[];
}

export interface ContentResponse {
    name: string;
    path: string;
    sha: string;
    size: number;
    encoding: 'base64' | string;
    content: string; // base64 string
}

@Injectable({ providedIn: 'root' })
export class GithubService {
    private base = 'https://api.github.com';

    private token: string | null = null;
    private username = 'clavison';

    constructor(private http: HttpClient) { }

    setToken(token?: string) {
        this.token = token?.trim() ? token.trim() : null;
    }

    setUsername(username: string) {
        this.username = username;
    }

    private headers(): HttpHeaders {
        let h = new HttpHeaders({
            Accept: 'application/vnd.github+json',
        });
        if (this.token) {
            h = h.set('Authorization', `Bearer ${this.token}`);
        }
        return h;
    }

    getUserRepos(): Observable<Repo[]> {
        return this.http.get<Repo[]>(
            `${this.base}/users/${this.username}/repos?per_page=100&sort=full_name&direction=asc`,
            { headers: this.headers() }
        );
    }

    getBranches(repo: string): Observable<BranchRef[]> {
        return this.http.get<BranchRef[]>(
            `${this.base}/repos/${this.username}/${repo}/branches?per_page=100`,
            { headers: this.headers() }
        );
    }

    getBranch(repo: string, branch: string): Observable<BranchRef> {
        return this.http.get<BranchRef>(
            `${this.base}/repos/${this.username}/${repo}/branches/${encodeURIComponent(branch)}`,
            { headers: this.headers() }
        );
    }

    getTree(repo: string, sha: string): Observable<TreeResponse> {
        return this.http.get<TreeResponse>(
            `${this.base}/repos/${this.username}/${repo}/git/trees/${sha}?recursive=1`,
            { headers: this.headers() }
        );
    }

    getFileContent(repo: string, path: string, ref: string): Observable<ContentResponse> {
        return this.http.get<ContentResponse>(
            `${this.base}/repos/${this.username}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(ref)}`,
            { headers: this.headers() }
        );
    }
}
