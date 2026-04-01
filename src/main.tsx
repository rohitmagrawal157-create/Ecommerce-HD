import { createRoot } from 'react-dom/client'
import './assets/css/style.css'
import App from './App.tsx'
// import { BrowserRouter } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom';
import SideSocialHandler from './components/social/SideSocialHandler';

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
    <SideSocialHandler
        whatsappLink="https://wa.link/n1cs15"
        chatPluginName="YellowMessengerPlugin"
      />
  </BrowserRouter>,
)
