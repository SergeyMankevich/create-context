import { createContext, useContext, useState } from 'react';

const StateManagerContext = createContext({
	state: null,
	setState: () => {},
	// updateState({ existedKey: value }) - перезаписать value для свойства с existedKey
	// updateState([{ id: existedId, ...data }]) - перезаписать в массиве элемент с existedId
	// updateState([{ id: newId, ...data }]) - добавить в массив элемент с newId
	// updateState([{ id: existedId}]) - удалить из массива элемент с existedId
	updateState: () => {},
});

const checkEmptyObject = (obj) => Object.keys(obj).length === 0;

const getUpdatedState = (state, newStateData) =>
	Array.isArray(newStateData)
		? updateStateArray(state, newStateData)
		: updateStateObject(state, newStateData);

const updateStateArray = (state, newStateData) =>
	newStateData.reduce((updatedState, { id, ...newItemData }) => {
		const foundItem = state.find(({ id: itemId }) => itemId === id);

		if (!foundItem) {
			return [{ id, ...newItemData }, ...updatedState];
		}

		if (checkEmptyObject(newItemData)) {
			return updatedState.filter(({ id: idToCheck }) => idToCheck !== id);
		}

		return updatedState.map((item) =>
			item.id === id ? { ...item, ...newItemData } : item,
		);
	}, state);

const updateStateObject = (state, newStateData) =>
	Object.entries(newStateData).reduce(
		(updatedState, [key, value]) => ({
			...updatedState,
			[key]:
				typeof value === 'object' && value !== null
					? getUpdatedState(updatedState[key], value)
					: value,
		}),
		state,
	);

export const StateManager = ({ children, initialState }) => {
	const [state, setState] = useState(initialState);

	const updateState = (newStateData) => setState(getUpdatedState(state, newStateData));

	return (
		<StateManagerContext.Provider value={{ state, setState, updateState }}>
			{children}
		</StateManagerContext.Provider>
	);
};

export const useStateManager = () => useContext(StateManagerContext);
