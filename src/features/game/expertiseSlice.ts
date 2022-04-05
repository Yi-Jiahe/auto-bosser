import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface Expertise {
    [key: string]: number;
}

export interface expertiseState {
    expertise: Expertise;
}

const initialState: expertiseState = {
    expertise: {},
};

export const expertiseSlice = createSlice({
    name: 'expertise',
    initialState: initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        increase: (state, action: PayloadAction<string>) => {
            const currentExpertise = state.expertise[action.payload];
            if (currentExpertise === undefined) {
                state.expertise[action.payload] = 0.01;
            } else {
                state.expertise[action.payload] = currentExpertise + 0.01;
            }
        },
        reset: (_state) => { return initialState; }
    }
});

export const { increase, reset } = expertiseSlice.actions;

export const selectExpertise = (state: RootState) => state.expertise.expertise;

export default expertiseSlice.reducer;
