import { createApp } from 'vue'
import './style.css'

import { Search } from 'vant';
import { lazyPlugin } from './directives';


import App from './App.vue'
import router from './router'

import { Tabbar, TabbarItem } from 'vant';
import 'vant/lib/index.css';

const app = createApp(App);
app.use(router);
app.use(Tabbar);
app.use(TabbarItem);
app.use(Search);
app.use(lazyPlugin)
app.mount('#app');
