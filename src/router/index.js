import { createRouter, createWebHistory } from 'vue-router';

const Home = () => import("../views/HelloWorld" /* webpackChunkName: "home" */);

const routes = [
    {
        path: '/astro',
        name: 'Home',
        component: Home
    }
];

const router = createRouter({
    history: createWebHistory(),
    base: "astro",
    routes
});

export default router
