export const UtterancesComments: React.FC = () => (
  <section
    ref={elem => {
      if (!elem) {
        return;
      }
      const scriptElem = document.createElement('script');
      scriptElem.src = 'https://utteranc.es/client.js';
      scriptElem.async = true;
      scriptElem.crossOrigin = 'anonymous';
      scriptElem.setAttribute('repo', 'viniciusbe/Desafio06');
      scriptElem.setAttribute('issue-term', 'pathname');
      scriptElem.setAttribute('theme', 'github-dark');
      elem.appendChild(scriptElem);
    }}
  />
);
