import { createRouter, createWebHistory } from 'vue-router';

const Home = () => import("../views/Home" /* webpackChunkName: "home" */);
const Game = () => import("../views/Game" /* webpackChunkName: "game" */);

const routes = [
    {
        path: '/cosmos',
        name: 'Home',
        component: Home
    },
    {
        path: '/cosmos/:gameId',
        name: 'Game',
        component: Game
    }
];

const router = createRouter({
    history: createWebHistory(),
    base: "cosmos",
    routes
});

export default router
