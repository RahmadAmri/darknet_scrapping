#!/bin/bash

# Darknet Scraper - Quick Start Script
# This script helps you get started with the scraper

echo "╔════════════════════════════════════════════════════════╗"
echo "║       Darknet Scraper - Quick Start                   ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "   Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if Tor is running
echo "🔍 Checking Tor availability..."
TOR_9050=$(lsof -i :9050 2>/dev/null | grep -i tor)
TOR_9150=$(lsof -i :9150 2>/dev/null | grep -i tor)

if [ -n "$TOR_9050" ]; then
    echo "✅ Tor is running on port 9050 (standalone)"
elif [ -n "$TOR_9150" ]; then
    echo "✅ Tor is running on port 9150 (Tor Browser)"
else
    echo "❌ Tor is not running!"
    echo ""
    echo "Please start Tor:"
    echo "  Option 1: Install standalone Tor"
    echo "    brew install tor"
    echo "    tor"
    echo ""
    echo "  Option 2: Open Tor Browser"
    echo "    Download from: https://www.torproject.org/"
    echo ""
    exit 1
fi

echo ""
echo "🚀 Starting the scraper..."
echo ""

node run.js

echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ Scraping completed!"
echo "📁 Check the output/ directory for results"
echo "════════════════════════════════════════════════════════"
