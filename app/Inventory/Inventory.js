"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Divider,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import { CiFilter } from "react-icons/ci";
import InventoryPapers from "../components/InventoryPapers";

export default function Inventory() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterType, setFilterType] = useState("quantity_asc"); // New state for filter type

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
    handleClose();
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    handleClose();
  };

  return (
    <div
      style={{
        bgColor: "red",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          bgColor: "red",
        }}
      >
        <Typography variant="h2">Inventory</Typography>
        <Button
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={handleClick}
        >
          <span>
            <CiFilter />
          </span>
          <span>Filter</span>
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={() => handleSortChange("asc")}>
            Less Quantity
          </MenuItem>
          <MenuItem onClick={() => handleSortChange("desc")}>
            More Quantity
          </MenuItem>
          <MenuItem onClick={() => handleFilterChange("start_a")}>
            Start By A
          </MenuItem>
          <MenuItem onClick={() => handleFilterChange("start_z")}>
            Start By Z
          </MenuItem>
        </Menu>
      </Box>
      <Divider />
      <Box
        sx={{
          margin: "20px",
        }}
      >
        <InventoryPapers sortOrder={sortOrder} filterType={filterType} />
      </Box>
    </div>
  );
}
