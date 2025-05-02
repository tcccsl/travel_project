import { createApp } from 'vue'
import './style.css'

import { Search } from 'vant';
import { lazyPlugin } from './directives';
import { createPinia } from 'pinia';

import App from './App.vue'
import router from './router'

import { Tabbar, TabbarItem } from 'vant';
import { Form, Field, CellGroup,Button } from 'vant';
import { Notify } from 'vant';
import 'vant/lib/index.css';

const app = createApp(App);
app.use(router);
app.use(Tabbar);
app.use(TabbarItem);
app.use(Search);
app.use(lazyPlugin)
app.use(createPinia())
app.use(Form);
app.use(Field);
app.use(CellGroup);
app.use(Button)
app.use(Notify)
app.mount('#app');
