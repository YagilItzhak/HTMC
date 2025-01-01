import HTMCDefine from './components/HTMCDefine';
import HTMCAttach from './components/HTMCAttach';

// Ensure custom elements are registered
customElements.define('htmc-define', HTMCDefine);
customElements.define('htmc-attach', HTMCAttach);

// Optionally expose components globally (if needed)
export { HTMCDefine, HTMCAttach };
