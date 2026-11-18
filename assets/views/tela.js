// NCM: consulta da nomenclatura do Siscomex.
import { sb } from '../api.js';
import * as ui from '../ui.js';

const POR_PAGINA = 50;

const dataBR = (v) => {
  if (!v) return '—';
  const [a, m, d] = String(v).split('-');
  return `${d}/${m}/${a}`;
};

export async function render(raiz, ctx) {
  ctx.setTitulo('NCM');

  let termo = '';
  let pagina = 0;
  let total = 0;

  raiz.innerHTML = `
    <div class="cartao">
      <div class="cartao-topo">
        <h2>Nomenclatura NCM</h2>
        <span class="sub" id="total"></span>
      </div>
      <div class="linha-acoes" style="margin-bottom:12px">
        <input type="search" id="busca" placeholder="Código ou descrição (ex.: 2203 ou cerveja)"
               style="max-width:420px">
        <button type="button" class="botao-primario" id="buscar">Buscar</button>
      </div>
      <div id="lista"><div class="carregando">Carregando…</div></div>
      <div class="linha-acoes" style="margin-top:14px;justify-content:center">
        <button type="button" id="anterior">← Anterior</button>
        <span class="sub" id="pagina"></span>
        <button type="button" id="proxima">Próxima →</button>
      </div>
    </div>`;

  const lista = raiz.querySelector('#lista');
  const campoBusca = raiz.querySelector('#busca');

  async function consultar() {
    lista.innerHTML = '<div class="carregando">Consultando…</div>';
    const inicio = pagina * POR_PAGINA;
    let q = sb.from('ncm').select('*', { count: 'exact' });

    if (termo) {
      const limpo = termo.replace(/[%,()]/g, ' ').trim();
      q = q.or(`codigo.ilike.%${limpo}%,descricao.ilike.%${limpo}%`);
    }

    const { data, count, error } = await q.order('codigo').range(inicio, inicio + POR_PAGINA - 1);
    if (error) {
      lista.innerHTML = `<div class="erro">${ui.esc(error.message)}</div>`;
      return;
    }

    total = count || 0;
    raiz.querySelector('#total').textContent = `${total.toLocaleString('pt-BR')} código(s)`;
    raiz.querySelector('#pagina').textContent =
      `página ${pagina + 1} de ${Math.max(1, Math.ceil(total / POR_PAGINA))}`;
    raiz.querySelector('#anterior').disabled = pagina === 0;
    raiz.querySelector('#proxima').disabled = inicio + POR_PAGINA >= total;

    lista.innerHTML = data.length ? `
      <div class="tabela-rolagem"><table>
        <thead><tr><th>NCM</th><th>Descrição</th><th>Data início</th><th>Data fim</th>
          <th>Ato legal</th><th>Nº</th><th>Ano</th></tr></thead>
        <tbody>
          ${data.map((n) => `<tr>
            <td class="mono">${ui.esc(n.codigo)}</td>
            <td>${ui.esc(n.descricao)}</td>
            <td>${dataBR(n.data_inicio)}</td>
            <td>${dataBR(n.data_fim)}</td>
            <td>${ui.esc(n.ato_legal_inicio || '—')}</td>
            <td class="mono">${ui.esc(n.numero || '—')}</td>
            <td>${ui.esc(n.ano || '—')}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>` : ui.vazio('Nenhum código encontrado.');
  }

  raiz.querySelector('#buscar').addEventListener('click', () => {
    termo = campoBusca.value.trim();
    pagina = 0;
    consultar();
  });
  campoBusca.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      termo = campoBusca.value.trim();
      pagina = 0;
      consultar();
    }
  });
  raiz.querySelector('#anterior').addEventListener('click', () => {
    if (pagina > 0) { pagina -= 1; consultar(); }
  });
  raiz.querySelector('#proxima').addEventListener('click', () => {
    if ((pagina + 1) * POR_PAGINA < total) { pagina += 1; consultar(); }
  });

  await consultar();
}
