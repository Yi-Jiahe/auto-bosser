import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { Expertise } from './expertiseSlice';

export interface attempt {
    playerHP: number,
    bossHP: number,
    expertise: Array<Expertise>
}

interface attempts {
    [key: string]: Array<attempt>;
}

interface progressState {
    boss: number;
    attempts: attempts
}

interface attemptAction {
    bossName: string,
    attempt: attempt,
}

const initialState: progressState = {
    boss: 0,
    attempts: {}
};

export const progressSlice = createSlice({
    name: 'progress',
    initialState: initialState,
    reducers: {
        setBossProgress: (state, action: PayloadAction<number>) => {
            state.boss = action.payload;
        },
        logAttempt: (state, action: PayloadAction<attemptAction>) => {
            const previousAttempts = state.attempts[action.payload.bossName];
            if (previousAttempts === undefined) {
                state.attempts[action.payload.bossName] = [action.payload.attempt]
            } else {
                state.attempts[action.payload.bossName] = [
                    ...previousAttempts,
                    action.payload.attempt
                ]
            }
        },
        reset: () => {}
    }
});

export const { setBossProgress, logAttempt, reset } = progressSlice.actions;

export const selectBossProgress = (state: RootState) => state.progress.boss;
export const selectAttempts = (state: RootState) => state.progress.attempts;

export default progressSlice.reducer;
