import { createRouter, createWebHistory } from 'vue-router';

const Home = () => import("../views/Home" /* webpackChunkName: "home" */);
const Game = () => import("../views/Game" /* webpackChunkName: "game" */);

const routes = [
    {
        path: '/astro',
        name: 'Home',
        component: Home
    },
    {
        path: '/astro/:gameId',
        name: 'Game',
        component: Game
    }
];

const router = createRouter({
    history: createWebHistory(),
    base: "astro",
    routes
});

export default router
