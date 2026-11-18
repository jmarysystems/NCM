# NCM

Consulta da nomenclatura NCM (Siscomex), no mesmo padrão dos demais sistemas.

## Dados

Tabela `ncm` no Supabase, carregada do arquivo público do Portal Único do
Comércio Exterior:

`https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json`

15.157 códigos, com descrição, vigência e ato legal.

## Permissões

Módulo `ncm` do Controle de Acesso.

## Rodar localmente

```bash
python -m http.server 5500
```
