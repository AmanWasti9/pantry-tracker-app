"use client";

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/navigation";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import AddIcon from "@mui/icons-material/Add";
import Modal from "@mui/material/Modal";
import { Stack, Button, TextField, Snackbar } from "@mui/material";
import { firestore, storage } from "../../firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import { getAuth } from "firebase/auth";
import { deepOrange } from "@mui/material/colors";
import Avatar from "@mui/material/Avatar";
import { TbLogout2 } from "react-icons/tb";
import Inventory from "../Inventory/Inventory";
import UserDashboard from "../UserDashboard/UserDashboard";
import { brand } from "@/getLPTheme";

const drawerWidth = 240;

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "none",
  borderRadius: "6px",
  boxShadow: 24,
  p: 4,
};

// Define the SI units array
const siUnits = ["Kg", "g", "L", "mL"];

function page(props) {
  const { window } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [itemName, setItemName] = useState("");
  const [pantry, setPantry] = useState([]);
  const [quantity, setQuantity] = useState(1); // Default quantity is 1
  const [price, setPrice] = useState(""); // Add state for price
  const [expiryDate, setExpiryDate] = useState(""); // Add state for expiry date
  const [image, setImage] = useState(null); // Fixed initialization
  const [siUnit, setSiUnit] = useState(""); // Default value
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userFirstName, setUserFirstName] = useState("");
  const [currentView, setCurrentView] = useState("Dashboard"); // State for current view

  const auth = getAuth(); // Initialize Firebase Auth
  const user = auth.currentUser; // Get current user

  const [pantryInitialized, setPantryInitialized] = useState(false);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(firestore, "Users", user.uid); // Changed to "Users" collection
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setPantryInitialized(userData.pantryInitialized);
          setUserFirstName(capitalizeFirstLetter(userData.firstName)); // Fetch and capitalize first name
          if (!userData.pantryInitialized) {
            // Create initial pantry document
            setDoc(userDocRef, { pantryInitialized: true }, { merge: true });
          }
        }
      });
    }
  }, [user]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSnackbarClose = () => setSnackbarOpen(false);

  // Helper function to capitalize the first letter of a string
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  // Get the first letter of the user's first name
  const avatarLetter = userFirstName.charAt(0).toUpperCase();

  const handleClick = (text) => {
    if (text === "Add New Inventory") {
      handleOpen();
    } else {
      setCurrentView(text); // Update state based on clicked item
      setMobileOpen(false);
    }
  };

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const updatePantry = async (uid) => {
    if (pantryInitialized) {
      try {
        const snapshot = query(
          collection(firestore, "pantry"),
          where("userId", "==", uid)
        );
        const docs = await getDocs(snapshot);
        const pantryList = [];
        docs.forEach((doc) => {
          pantryList.push({ name: doc.id, ...doc.data() });
        });
        // console.log(pantryList);
        setPantry(pantryList);
      } catch (error) {
        console.error("Error fetching pantry data:", error);
      }
    }
  };

  useEffect(() => {
    if (user && pantryInitialized) {
      updatePantry(user.uid);
    }
  }, [user, pantryInitialized]);

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const uploadImage = async () => {
    if (image) {
      return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `images/${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            // console.log(`Upload is ${progress}% done`);
          },
          (error) => {
            console.error("Error uploading image:", error.message);
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              // console.log("Image uploaded successfully");
              resolve(downloadURL);
            });
          }
        );
      });
    }
    return "";
  };

  const addItem = async (
    item,
    quantity,
    siUnit,
    price,
    expiryDate,
    imageURL
  ) => {
    if (user) {
      try {
        const docuRef = doc(collection(firestore, "pantry"), user.uid); // Use user.uid for user-specific inventory
        const docSnap = await getDoc(docuRef);

        if (docSnap.exists()) {
          const existingItems = docSnap.data().items || {}; // Retrieve existing items
          existingItems[item] = {
            count: (existingItems[item]?.count || 0) + quantity, // Update count or initialize
            unit: siUnit,
            price: price, // Add price
            expiryDate: expiryDate, // Add expiry date
            image: imageURL,
          };

          await setDoc(docuRef, { items: existingItems }, { merge: true });
        } else {
          await setDoc(docuRef, {
            items: {
              [item]: {
                count: quantity,
                unit: siUnit,
                price: price, // Add price
                expiryDate: expiryDate, // Add expiry date
                image: imageURL,
              },
            },
          });
        }
      } catch (error) {
        console.error("Error adding item to pantry:", error);
      }
    }
  };

  const handleAddItem = async () => {
    setLoading(true);
    try {
      let imgURL = "";
      if (image) {
        imgURL = await uploadImage();
      }
      await addItem(itemName, quantity, siUnit, price, expiryDate, imgURL);
      setItemName("");
      setQuantity(1);
      setPrice("");
      setExpiryDate("");
      setSiUnit("");
      setImage(null);
      handleClose();
      updatePantry(user.uid);
      setSnackbarMessage("Item added successfully!");
    } catch (error) {
      console.error("Error handling add item:", error);
      setSnackbarMessage("Error adding item. Please try again.");
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleLogOut = async () => {
    // console.log("Logout button clicked"); // Add this line to check if the function is being called
    try {
      await auth.signOut();
      // console.log("User logged out successfully");
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider sx={{ bgcolor: "white" }} />
      <List>
        {[
          {
            text: "Dashboard",
            icon: <DashboardIcon sx={{ color: "white" }} />,
          },
          {
            text: "Inventory",
            icon: <InventoryIcon sx={{ color: "white" }} />,
          },
          {
            text: "Add New Inventory",
            icon: <AddIcon sx={{ color: "white" }} />,
          },
        ].map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => handleClick(item.text)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  color: "white",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Stack
        direction={"column"}
        sx={{
          position: "fixed",
          width: drawerWidth,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          height: "7vh",
        }}
      >
        <Divider
          sx={{
            bgcolor: "white",
          }}
        />
        <Stack
          direction={"row"}
          sx={{
            margin: "10px 5px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Stack
            direction={"row"}
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "5px",
            }}
          >
            <Avatar
              sx={{
                bgcolor: "transparent",
                border: "2px solid white",
                width: "5vh",
                height: "5vh",
              }}
            >
              {avatarLetter}
            </Avatar>

            <Typography
              sx={{
                color: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {userFirstName}
            </Typography>
          </Stack>
          <Stack
            sx={{
              color: "white",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              variant="standard"
              onClick={handleLogOut}
              sx={{
                width: "5vh",
                height: "5vh",
              }}
            >
              <TbLogout2
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex", backgroundColor: "white" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: "linear-gradient(#033363, #021F3B)",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            PantryPilot
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        container={container}
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerClose}
        onTransitionEnd={handleDrawerTransitionEnd}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            background: "linear-gradient(#033363, #021F3B)",
          },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            background: "linear-gradient(#033363, #021F3B)",
          },
        }}
      >
        {drawer}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          background: "white",
          p: 3,
          transition: "margin 0.3s",
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar />
        <Stack
          style={{
            background: "white",
          }}
        >
          {currentView === "Dashboard" && (
            <UserDashboard userFirstName={userFirstName} />
          )}
          {currentView === "Inventory" && <Inventory />}
        </Stack>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-title" variant="h6" component="h2">
              Add New Inventory Item
            </Typography>
            <Stack spacing={2} mt={2}>
              <TextField
                label="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Stack
                direction={"row"}
                sx={{
                  display: "flex",
                  gap: "20px",
                }}
              >
                <TextField
                  label="Quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
                <Select
                  value={siUnit}
                  onChange={(e) => setSiUnit(e.target.value)}
                  displayEmpty
                  inputProps={{ "aria-label": "SI Unit" }}
                >
                  <MenuItem value="" disabled>
                    Select SI Unit
                  </MenuItem>
                  {siUnits.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
              <TextField
                label="Price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <TextField
                label="Expiry Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
              <Button
                variant="contained"
                component="label"
                sx={{
                  background: "linear-gradient(#033363, #021F3B)",
                }}
              >
                Upload Image
                <input type="file" hidden onChange={handleChange} />
              </Button>
              {loading && <LinearProgress />}
              <Button
                variant="contained"
                onClick={handleAddItem}
                disabled={loading}
                sx={{
                  background: "linear-gradient(#033363, #021F3B)",
                }}
              >
                Add Item
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          message={snackbarMessage}
        />
      </Box>
    </Box>
  );
}

page.propTypes = {
  window: PropTypes.func,
};

export default page;
