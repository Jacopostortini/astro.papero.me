import { createRouter, createWebHistory } from 'vue-router';

const Home = () => import("../views/HelloWorld" /* webpackChunkName: "home" */);

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    }
];

const router = createRouter({
    history: createWebHistory(),
    base: "unseen",
    routes
});

export default router
