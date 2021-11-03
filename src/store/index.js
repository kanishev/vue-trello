import Vue from "vue";
import Vuex from "vuex";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import db from "../firebase/firebaseInit";

Vue.use(Vuex);
import { generateId } from "../utlis/generateId";

export default new Vuex.Store({
  state: {
    user: null,
    boards: [],
    activeBoard: null,
    activePage: "default",

    // Profile
    profileEmail: null,
    profileFirstName: null,
    profileLastName: null,
    profileId: null,
    profileInitials: null,
  },
  mutations: {
    // BOARDS

    saveBoard(state, payload) {
      const board = state.boards.find((b) => b.id == payload.id);
      const idx = state.boards.findIndex((b) => b.id === payload.id);

      if (idx !== -1) {
        board.name = payload.name;
        board.description = payload.description;
        state.boards[idx] = board;
      } else {
        const board = {
          id: generateId(),
          name: payload.name,
          description: payload.description,
          lists: [],
          archived: false,
        };
        state.boards.push(board);
      }
    },
    archiveBoard(state, payload) {
      const board = state.boards.find((b) => b.id == payload.id);
      const idx = state.boards.findIndex((b) => b.id === payload.id);
      board.archived = !board.archived;
      state.boards[idx] = board;

      console.log(state.boards);
    },

    // LISTS

    createTaskList(state, payload) {
      const board = state.boards.find((b) => b.id == payload.boardId);
      const boardId = state.boards.findIndex((b) => b.id == payload.boardId);

      const list = board.lists.find((l) => l.id === payload.listId);
      const listIdx = board.lists.findIndex((l) => l.id == payload.listId);

      if (listIdx !== -1) {
        list.name = payload.name;
        state.boards[boardId].lists[listIdx] = list;
      } else {
        const list = {
          id: generateId(),
          name: payload.name,
          archived: false,
          items: [],
        };
        board.lists.push(list);
      }
    },
    createListItem(state, payload) {
      const board = state.boards.find((b) => b.id == payload.boardId);
      const list = board.lists.find((l) => l.id === payload.listId);
      const item = {
        id: generateId(),
        name: payload.name,
      };

      list.items.push(item);
    },
    removeListItem(state, payload) {
      const board = state.boards.find((b) => b.id == payload.boardId);
      const items = board.lists.find((l) => l.id === payload.listId).items;
      const itemsId = board.lists.findIndex((l) => l.id == payload.listId);
      let updatedItems = items.filter((i) => i.id !== payload.itemId);
      board.lists[itemsId].items = updatedItems;

      console.log(payload);
    },
    updateListItem(state, payload) {
      const board = state.boards.find((b) => b.id == payload.boardId);
      const items = board.lists.find((l) => l.id === payload.listId).items;
      let item = items.find((i) => i.id == payload.itemId);

      item.name = payload.name;
    },
    reorderListItems(state, payload) {
      const board = state.boards.find((b) => b.id == payload.boardId);
      const list = board.lists.find((l) => l.id == payload.listId);

      list.items = payload.payload;
    },
    reorderList(state, payload) {
      const boardId = state.boards.findIndex((b) => b.id == payload.boardId);
      state.boards[boardId].lists = payload.payload;
    },
    archiveList(state, payload) {
      const board = state.boards.find((b) => b.id == payload.boardId);
      const list = board.lists.find((l) => l.id == payload.listId);
      list.archived = !list.archived;
    },
    setActiveBoard(state, payload) {
      state.activeBoard = payload;
    },
    setActivePage(state, payload) {
      state.activePage = payload;
    },

    // USER
    updateUser(state, p) {
      state.user = p;
    },
    setProfile(state, p) {
      state.profileId = p.id;
      state.profileEmail = p.data().email;
      state.profileFirstName = p.data().firstName;
      state.profileLastName = p.data().lastName;
    },
    setProfileInitials(state) {
      state.profileInitials =
        state.profileFirstName
          .match(/(\b\S)?/g)
          .join("")
          .toUpperCase() +
        state.profileLastName
          .match(/(\b\S)?/g)
          .join("")
          .toUpperCase();
    },
  },
  actions: {
    async getUser({ commit }) {
      const dataBase = await db
        .collection("users")
        .doc(firebase.auth().currentUser.uid);
      const dbResults = await dataBase.get();
      commit("setProfile", dbResults);
      commit("setProfileInitials");
      console.log(dbResults);
    },
    async updateUserProfile(ctx) {
      const dataBase = await db.collection("users").doc(ctx.state.profileId);
      await dataBase.update({
        firstName: ctx.state.profileFirstName,
        lastName: ctx.state.profileLastName,
      });
      ctx.commit("setProfileInitials");
    },
  },
  getters: {
    getBoards(state) {
      return state.boards;
    },
    unarchivedBoards(state) {
      return state.boards.filter((b) => !b.archived);
    },
    archivedBoards(state) {
      return state.boards.filter((b) => b.archived);
    },
    getActivePage(state) {
      return state.activePage;
    },
    getArchivedLists: (state) =>
      state.activeBoard
        ? state.activeBoard.lists.filter((l) => l.archived)
        : [],
  },
});
