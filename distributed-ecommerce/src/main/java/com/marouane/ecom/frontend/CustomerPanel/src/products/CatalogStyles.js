import { styled } from '@mui/material/styles';
import { Box, Paper, Grid } from '@mui/material';

export const MainContentBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
        flexDirection: 'row',
    },
    gap: theme.spacing(3),
}));

export const FilterSidebar = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    [theme.breakpoints.up('md')]: {
        width: 250,
        flexShrink: 0,
    },
}));

export const ProductsDisplayArea = styled(Grid)(({ theme }) => ({
    flexGrow: 1,
}));

export const productCardStyles = {
    height: '100%',
    width: '300px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
        transform: 'translateY(-6px) scale(1.03)',
        boxShadow: 6,
    }
};

export const loadingContainerStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh'
};