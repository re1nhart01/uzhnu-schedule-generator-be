import {createStore,  } from "zustand";


type adminConfigStoreType = unknown


const useAdminConfigStore = createStore<adminConfigStoreType>((set, getState, store) => ({
    blocks: [],
    addBlock: () => set((state) => {

    })
}));
