import {createStore} from "vuex";

export default createStore({
    state: {
        logged: -1, //TODO: CHANGE HERE
        username: "" //TODO: CHANGE HERE
    },
    mutations: {
        SET_LOGGED(state, logged) {
            state.logged = logged;
        },
        SET_USERNAME(state, username) {
            state.username = username;
        }
    },
    actions: {
        setUsername({ commit }, username){
            commit("SET_USERNAME", username);
        },
        setLogged({ commit }, logged){
            commit("SET_LOGGED", logged);
        }
    }
})