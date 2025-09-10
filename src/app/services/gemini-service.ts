import { Injectable } from '@angular/core';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeminiApiService {
  private genAI!: GoogleGenerativeAI;

  constructor() { }

  // Inicializa a SDK com a chave do usuário
  public initialize(apiKey: string): void {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  // Faz a chamada à API do Gemini
  public generateContent(prompt: string): Observable<string> {
    if (!this.genAI) {
      throw new Error('SDK não inicializada. Por favor, forneça sua chave de API primeiro.');
    }

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.0
      }
    });

    const promise = model.generateContent(prompt)
      .then(result => result.response.text());

    return from(promise);
  }
}