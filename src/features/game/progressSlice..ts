import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface progressState {
    boss: number;
}

const initialState: progressState = {
    boss: 0,
};

export const progressSlice = createSlice({
    name: 'progress',
    initialState: initialState,
    reducers: {
        setBossProgress: (state, action: PayloadAction<number>) => {
            state.boss = action.payload;
        },
    }
});

export const { setBossProgress } = progressSlice.actions;

export const selectBossProgress = (state: RootState) => state.progress.boss;

export default progressSlice.reducer;
