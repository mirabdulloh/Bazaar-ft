import { enqueueSnackbar } from 'notistack';

export const sweetErrorAlert = async (message: string): Promise<void> => {
	enqueueSnackbar(message, { variant: 'error' });
};

export const sweetMixinErrorAlert = async (message: string): Promise<void> => {
	enqueueSnackbar(message, { variant: 'error' });
};

export const sweetMixinSuccessAlert = async (message: string): Promise<void> => {
	enqueueSnackbar(message, { variant: 'success' });
};

export const sweetTopSmallSuccessAlert = async (message: string): Promise<void> => {
	enqueueSnackbar(message, { variant: 'success', anchorOrigin: { vertical: 'top', horizontal: 'center' } });
};
