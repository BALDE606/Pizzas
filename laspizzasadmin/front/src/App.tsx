import './App.css';
import Encabezado from './components/Encabezado';
import Pie from './components/Pie';
import BannerRotativo from './components/Banner';
import PedidosPendientes from './components/PedidosPendientes';
import CorteCaja from './components/CorteCaja';


function App() {
  return (
    <div className='App'>
      <Encabezado />
      <BannerRotativo />
      <CorteCaja />
      <PedidosPendientes />
      <Pie />
    </div>
  );
}

export default App;
