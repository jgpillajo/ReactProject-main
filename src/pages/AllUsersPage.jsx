import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContext';
import { getUsers, updateUserRole, deleteUser } from '../services/firebase';
import { getFlatCountByUser } from '../services/firebaseFlats';
import { 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  TableSortLabel,
  Avatar,
  CircularProgress,
  Select,
  MenuItem,
  Button,
  TextField,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
  useTheme,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AllUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orderBy, setOrderBy] = useState('lastName');
    const [order, setOrder] = useState('asc');
    const [filterRole, setFilterRole] = useState('');
    const [ageRange, setAgeRange] = useState({ min: '', max: '' });
    const [flatsRange, setFlatsRange] = useState({ min: '', max: '' });
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                console.log("Fetching users...");
                let fetchedUsers = await getUsers();
                const usersWithFlatCount = await Promise.all(fetchedUsers.map(async (user) => {
                    const flatCount = await getFlatCountByUser(user.id);
                    return { ...user, flatCount };
                }));
                setUsers(usersWithFlatCount);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching users:", err);
                setError("Failed to load users. Please try again later.");
                setLoading(false);
            }
        };

        if (user && user.rol === 'admin') {
            fetchUsers();
        } else {
            setError("You don't have permission to view this page.");
            setLoading(false);
        }
    }, [user]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUserRole(userId, newRole);
            setUsers(users.map(u => u.id === userId ? {...u, rol: newRole} : u));
        } catch (error) {
            console.error("Error updating user role:", error);
            alert("Failed to update user role. Please try again.");
        }
    };

    const handleDeleteUser = (user) => {
        setUserToDelete(user);
        setDeleteConfirmOpen(true);
    };

    const confirmDeleteUser = async () => {
        try {
            await deleteUser(userToDelete.id);
            setUsers(users.filter(u => u.id !== userToDelete.id));
            setDeleteConfirmOpen(false);
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user. Please try again.");
        }
    };

    const handleOpenProfile = (userId) => {
        navigate(`/user/${userId}`);
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return 0;
        const today = new Date();
        const birthDateObj = birthDate.toDate();
        let age = today.getFullYear() - birthDateObj.getFullYear();
        const m = today.getMonth() - birthDateObj.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
            age--;
        }
        return age;
    };

    const filteredUsers = users.filter(user => {
        const roleMatch = !filterRole || user.rol === filterRole;
        const ageMatch = (!ageRange.min || calculateAge(user.birthDate) >= ageRange.min) &&
                         (!ageRange.max || calculateAge(user.birthDate) <= ageRange.max);
        const flatsMatch = (!flatsRange.min || user.flatCount >= flatsRange.min) &&
                           (!flatsRange.max || user.flatCount <= flatsRange.max);
        return roleMatch && ageMatch && flatsMatch;
    });

    const sortedUsers = filteredUsers.sort((a, b) => {
        if (orderBy === 'flatCount') {
            return order === 'asc' ? a.flatCount - b.flatCount : b.flatCount - a.flatCount;
        }
        const aValue = a[orderBy] || '';
        const bValue = b[orderBy] || '';
        return order === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });

    const renderDesktopView = () => (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Avatar</TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={orderBy === 'firstName'}
                                direction={orderBy === 'firstName' ? order : 'asc'}
                                onClick={() => handleRequestSort('firstName')}
                            >
                                Nombre
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={orderBy === 'lastName'}
                                direction={orderBy === 'lastName' ? order : 'asc'}
                                onClick={() => handleRequestSort('lastName')}
                            >
                                Apellido
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Fecha de Nacimiento</TableCell>
                        <TableCell>Rol</TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={orderBy === 'flatCount'}
                                direction={orderBy === 'flatCount' ? order : 'asc'}
                                onClick={() => handleRequestSort('flatCount')}
                            >
                                Flats Creados
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <Avatar 
                                    src={user.imageUid ? `https://firebasestorage.googleapis.com/v0/b/reactproject-9049c.appspot.com/o/${encodeURIComponent(user.imageUid)}?alt=media` : undefined} 
                                    alt={`${user.firstName} ${user.lastName}`}
                                />
                            </TableCell>
                            <TableCell>{user.firstName}</TableCell>
                            <TableCell>{user.lastName}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                                {user.birthDate && user.birthDate.toDate ? 
                                    user.birthDate.toDate().toLocaleDateString('es-ES') : 
                                    'No proporcionado'}
                            </TableCell>
                            <TableCell>{user.rol || 'usuario'}</TableCell>
                            <TableCell>{user.flatCount || 0}</TableCell>
                            <TableCell>
                                <Button onClick={() => handleOpenProfile(user.id)}>Ver Perfil</Button>
                                <Select
                                    value={user.rol || 'usuario'}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="usuario">Usuario</MenuItem>
                                    <MenuItem value="admin">Admin</MenuItem>
                                </Select>
                                <Button onClick={() => handleDeleteUser(user)} color="error">Eliminar</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const renderMobileView = () => (
        <Grid container spacing={2}>
            {sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                <Grid item xs={12} key={user.id}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                                <Avatar 
                                    src={user.imageUid ? `https://firebasestorage.googleapis.com/v0/b/reactproject-9049c.appspot.com/o/${encodeURIComponent(user.imageUid)}?alt=media` : undefined} 
                                    alt={`${user.firstName} ${user.lastName}`}
                                    sx={{ mr: 2 }}
                                />
                                <Typography variant="h6">{`${user.firstName} ${user.lastName}`}</Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Email: {user.email}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Fecha de Nacimiento: {user.birthDate && user.birthDate.toDate ? 
                                    user.birthDate.toDate().toLocaleDateString('es-ES') : 
                                    'No proporcionado'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Rol: {user.rol || 'usuario'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Flats Creados: {user.flatCount || 0}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small" onClick={() => handleOpenProfile(user.id)}>Ver Perfil</Button>
                            <Select
                                size="small"
                                value={user.rol || 'usuario'}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                displayEmpty
                            >
                                <MenuItem value="usuario">Usuario</MenuItem>
                                <MenuItem value="admin">Admin</MenuItem>
                            </Select>
                            <Button size="small" onClick={() => handleDeleteUser(user)} color="error">Eliminar</Button>
                        </CardActions>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography color="error">{error}</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mt: 4, mb: 4 }}>
                Usuarios Registrados
            </Typography>
            <Box sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Select
                            fullWidth
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="">Todos los roles</MenuItem>
                            <MenuItem value="usuario">Usuario</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                    </Grid>
                    <Grid item xs={6} sm={3} md={2}>
                        <TextField
                            fullWidth
                            label="Edad mínima"
                            type="number"
                            value={ageRange.min}
                            onChange={(e) => setAgeRange({...ageRange, min: e.target.value})}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3} md={2}>
                        <TextField
                            fullWidth
                            label="Edad máxima"
                            type="number"
                            value={ageRange.max}
                            onChange={(e) => setAgeRange({...ageRange, max: e.target.value})}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3} md={2}>
                        <TextField
                            fullWidth
                            label="Flats mínimos"
                            type="number"
                            value={flatsRange.min}
                            onChange={(e) => setFlatsRange({...flatsRange, min: e.target.value})}
                        />
                    </Grid>
                    <Grid item xs={6} sm={3} md={2}>
                        <TextField
                            fullWidth
                            label="Flats máximos"
                            type="number"
                            value={flatsRange.max}
                            onChange={(e) => setFlatsRange({...flatsRange, max: e.target.value})}
                        />
                    </Grid>
                </Grid>
            </Box>
            {isMobile || isTablet ? renderMobileView() : renderDesktopView()}
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={sortedUsers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"¿Confirmar eliminación de usuario?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Esta acción no se puede deshacer. ¿Está seguro de que desea eliminar a este usuario?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
                    <Button onClick={confirmDeleteUser} color="error" autoFocus>
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AllUsersPage;