export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      dbpedidos: {
        Row: {
          id: string;
          numero_seq: number;
          nome_cliente: string;
          total: number;
          created_at: string | null;
          updated_at: string | null;
          status: string | null;
          tipo: string | null;
          mesa: string | null;
          observacao: string | null;
          telefone: string | null;
          endereco: Json | null;
          pedido: Json | null;
          atendente: string | null;
        };
        Insert: {
          id?: string;
          numero_seq?: number;
          nome_cliente: string;
          total: number;
          created_at?: string | null;
          updated_at?: string | null;
          status?: string | null;
          tipo?: string | null;
          mesa?: string | null;
          observacao?: string | null;
          telefone?: string | null;
          endereco?: Json | null;
          pedido?: Json | null;
          atendente?: string | null;
        };
        Update: {
          id?: string;
          numero_seq?: number;
          nome_cliente?: string;
          total?: number;
          created_at?: string | null;
          updated_at?: string | null;
          status?: string | null;
          tipo?: string | null;
          mesa?: string | null;
          observacao?: string | null;
          telefone?: string | null;
          endereco?: Json | null;
          pedido?: Json | null;
          atendente?: string | null;
        };
      };
      // … repita para outras tabelas
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
