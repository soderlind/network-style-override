#!/usr/bin/env bash
#
# Acceptance tests for Multisite Override Style plugin.
# Requires: WP-CLI, running Local by Flywheel site, network-activated plugin.
#
# Usage:
#   ./tests/Acceptance/run-acceptance-tests.sh [--url=http://plugins.local/]
#
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default URL
SITE_URL="${1:-http://plugins.local/}"
SITE_URL="${SITE_URL#--url=}"

# Counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Plugin slug (note: typo in directory name)
PLUGIN_SLUG="multisite-overide-style"

# WP-CLI wrapper
wp_cmd() {
    wp --url="$SITE_URL" "$@"
}

# Test helpers
pass() {
    echo -e "${GREEN}✓ PASS:${NC} $1"
    ((TESTS_PASSED++))
}

fail() {
    echo -e "${RED}✗ FAIL:${NC} $1"
    ((TESTS_FAILED++))
}

skip() {
    echo -e "${YELLOW}○ SKIP:${NC} $1"
    ((TESTS_SKIPPED++))
}

section() {
    echo ""
    echo -e "${YELLOW}━━━ $1 ━━━${NC}"
}

# Check prerequisites
check_prerequisites() {
    section "Prerequisites"

    # Check WP-CLI
    if ! command -v wp &> /dev/null; then
        fail "WP-CLI not found"
        exit 1
    fi
    pass "WP-CLI available"

    # Check database connection
    if ! wp_cmd core version &> /dev/null; then
        fail "Cannot connect to WordPress at $SITE_URL"
        echo "Make sure Local by Flywheel site is running."
        exit 1
    fi
    pass "WordPress connection OK ($(wp_cmd core version))"

    # Check multisite
    if ! wp_cmd core is-installed --network &> /dev/null; then
        fail "Not a multisite installation"
        exit 1
    fi
    pass "Multisite detected"

    # Check plugin is network activated
    local status
    status=$(wp_cmd plugin status "$PLUGIN_SLUG" 2>/dev/null || echo "not-found")
    if [[ "$status" == *"Network Activated"* ]] || [[ "$status" == *"Active"* ]]; then
        pass "Plugin $PLUGIN_SLUG is active"
    else
        fail "Plugin $PLUGIN_SLUG is not network activated"
        echo "Run: wp plugin activate $PLUGIN_SLUG --network"
        exit 1
    fi
}

# Test 1: REST API endpoints exist
test_rest_endpoints() {
    section "REST API Endpoints"

    # Get admin user for REST auth
    local admin_user
    admin_user=$(wp_cmd user list --role=administrator --field=user_login --number=1)

    if [[ -z "$admin_user" ]]; then
        skip "No admin user found"
        return
    fi

    # Test settings endpoint
    local settings_response
    settings_response=$(wp_cmd eval "
        wp_set_current_user(get_user_by('login', '$admin_user')->ID);
        \$request = new WP_REST_Request('GET', '/mos/v1/settings');
        \$response = rest_do_request(\$request);
        echo json_encode(\$response->get_data());
    " 2>/dev/null || echo "error")

    if [[ "$settings_response" == *"css"* ]] && [[ "$settings_response" == *"theme_json"* ]]; then
        pass "GET /mos/v1/settings returns expected fields"
    else
        fail "GET /mos/v1/settings failed: $settings_response"
    fi

    # Test network-themes endpoint
    local themes_response
    themes_response=$(wp_cmd eval "
        wp_set_current_user(get_user_by('login', '$admin_user')->ID);
        \$request = new WP_REST_Request('GET', '/mos/v1/network-themes');
        \$response = rest_do_request(\$request);
        echo json_encode(\$response->get_data());
    " 2>/dev/null || echo "error")

    if [[ "$themes_response" == "["* ]] || [[ "$themes_response" == "[]" ]]; then
        pass "GET /mos/v1/network-themes returns array"
    else
        fail "GET /mos/v1/network-themes failed: $themes_response"
    fi

    # Test theme-overrides endpoint
    local overrides_response
    overrides_response=$(wp_cmd eval "
        wp_set_current_user(get_user_by('login', '$admin_user')->ID);
        \$request = new WP_REST_Request('GET', '/mos/v1/theme-overrides');
        \$response = rest_do_request(\$request);
        echo json_encode(\$response->get_data());
    " 2>/dev/null || echo "error")

    if [[ "$overrides_response" == "{"* ]] || [[ "$overrides_response" == "{}" ]] || [[ "$overrides_response" == "[]" ]]; then
        pass "GET /mos/v1/theme-overrides returns object"
    else
        fail "GET /mos/v1/theme-overrides failed: $overrides_response"
    fi
}

# Test 2: CSS Override functionality
test_css_override() {
    section "CSS Override"

    local test_css="/* MOS Acceptance Test */ body { --mos-test: 1; }"

    # Save CSS
    wp_cmd eval "
        \$repo = new MultisiteOverrideStyle\Storage\SettingsRepository();
        \$repo->save_css('$test_css');
    " 2>/dev/null

    # Verify CSS was saved
    local saved_css
    saved_css=$(wp_cmd eval "
        \$repo = new MultisiteOverrideStyle\Storage\SettingsRepository();
        echo \$repo->get_css();
    " 2>/dev/null)

    if [[ "$saved_css" == *"MOS Acceptance Test"* ]]; then
        pass "CSS saved and retrieved correctly"
    else
        fail "CSS save/retrieve failed"
    fi

    # Clean up
    wp_cmd eval "
        \$repo = new MultisiteOverrideStyle\Storage\SettingsRepository();
        \$repo->save_css('');
    " 2>/dev/null
}

# Test 3: Theme JSON Override
test_theme_json_override() {
    section "Theme JSON Override"

    # Save theme.json
    wp_cmd eval "
        \$repo = new MultisiteOverrideStyle\Storage\SettingsRepository();
        \$repo->save_theme_json(['settings' => ['color' => ['palette' => []]]]);
    " 2>/dev/null

    # Verify theme.json was saved
    local saved_json
    saved_json=$(wp_cmd eval "
        \$repo = new MultisiteOverrideStyle\Storage\SettingsRepository();
        echo json_encode(\$repo->get_theme_json());
    " 2>/dev/null)

    if [[ "$saved_json" == *"settings"* ]] && [[ "$saved_json" == *"color"* ]]; then
        pass "theme.json saved and retrieved correctly"
    else
        fail "theme.json save/retrieve failed: $saved_json"
    fi

    # Clean up
    wp_cmd eval "
        \$repo = new MultisiteOverrideStyle\Storage\SettingsRepository();
        \$repo->save_theme_json([]);
    " 2>/dev/null
}

# Test 4: Theme-specific overrides
test_theme_overrides() {
    section "Theme-Specific Overrides"

    local test_theme="twentytwentyfive"
    local test_css="/* Theme-specific test */"
    local test_json='{"settings":{"color":{"background":true}}}'

    # Save theme override
    wp_cmd eval "
        \$repo = new MultisiteOverrideStyle\Storage\SettingsRepository();
        \$repo->save_theme_override('$test_theme', '$test_css', json_decode('$test_json', true));
    " 2>/dev/null

    # Verify CSS for theme
    local theme_css
    theme_css=$(wp_cmd eval "
        \$repo = new MultisiteOverrideStyle\Storage\SettingsRepository();
        echo \$repo->get_theme_css('$test_theme');
    " 2>/dev/null)

    if [[ "$theme_css" == *"Theme-specific test"* ]]; then
        pass "Theme-specific CSS saved correctly"
    else
        fail "Theme-specific CSS failed: $theme_css"
    fi

    # Verify theme.json for theme
    local theme_json
    theme_json=$(wp_cmd eval "
        \$repo = new MultisiteOverrideStyle\Storage\SettingsRepository();
        echo json_encode(\$repo->get_theme_json_for_theme('$test_theme'));
    " 2>/dev/null)

    if [[ "$theme_json" == *"background"* ]]; then
        pass "Theme-specific theme.json saved correctly"
    else
        fail "Theme-specific theme.json failed: $theme_json"
    fi

    # Test delete
    wp_cmd eval "
        \$repo = new MultisiteOverrideStyle\Storage\SettingsRepository();
        \$repo->delete_theme_override('$test_theme');
    " 2>/dev/null

    local deleted_css
    deleted_css=$(wp_cmd eval "
        \$repo = new MultisiteOverrideStyle\Storage\SettingsRepository();
        echo \$repo->get_theme_css('$test_theme');
    " 2>/dev/null)

    if [[ -z "$deleted_css" ]]; then
        pass "Theme override deleted correctly"
    else
        fail "Theme override delete failed"
    fi
}

# Test 5: Exemptions
test_exemptions() {
    section "Site Exemptions"

    # Get a subsite ID (not main site)
    local blog_id
    blog_id=$(wp_cmd site list --field=blog_id | tail -n1)

    if [[ -z "$blog_id" ]] || [[ "$blog_id" == "1" ]]; then
        skip "No subsite available for exemption test"
        return
    fi

    # Add exemption
    wp_cmd eval "
        \$repo = new MultisiteOverrideStyle\Storage\SettingsRepository();
        \$repo->add_exemption($blog_id);
    " 2>/dev/null

    # Check exemption
    local is_exempted
    is_exempted=$(wp_cmd eval "
        \$repo = new MultisiteOverrideStyle\Storage\SettingsRepository();
        echo \$repo->is_exempted($blog_id) ? 'true' : 'false';
    " 2>/dev/null)

    if [[ "$is_exempted" == "true" ]]; then
        pass "Site exemption added correctly"
    else
        fail "Site exemption failed"
    fi

    # Remove exemption
    wp_cmd eval "
        \$repo = new MultisiteOverrideStyle\Storage\SettingsRepository();
        \$repo->remove_exemption($blog_id);
    " 2>/dev/null

    is_exempted=$(wp_cmd eval "
        \$repo = new MultisiteOverrideStyle\Storage\SettingsRepository();
        echo \$repo->is_exempted($blog_id) ? 'true' : 'false';
    " 2>/dev/null)

    if [[ "$is_exempted" == "false" ]]; then
        pass "Site exemption removed correctly"
    else
        fail "Site exemption removal failed"
    fi
}

# Test 6: Export/Import
test_export_import() {
    section "Export/Import"

    local admin_user
    admin_user=$(wp_cmd user list --role=administrator --field=user_login --number=1)

    if [[ -z "$admin_user" ]]; then
        skip "No admin user found"
        return
    fi

    # Set some test data
    wp_cmd eval "
        \$repo = new MultisiteOverrideStyle\Storage\SettingsRepository();
        \$repo->save_css('/* Export test */');
        \$repo->save_theme_json(['version' => 3]);
        \$repo->save_theme_override('test-theme', '/* Theme export */', ['version' => 3]);
    " 2>/dev/null

    # Export
    local export_data
    export_data=$(wp_cmd eval "
        wp_set_current_user(get_user_by('login', '$admin_user')->ID);
        \$request = new WP_REST_Request('GET', '/mos/v1/export');
        \$response = rest_do_request(\$request);
        echo json_encode(\$response->get_data());
    " 2>/dev/null)

    if [[ "$export_data" == *"Export test"* ]] && [[ "$export_data" == *"theme_overrides"* ]]; then
        pass "Export includes all data including theme_overrides"
    else
        fail "Export missing data: $export_data"
    fi

    # Clean up
    wp_cmd eval "
        \$repo = new MultisiteOverrideStyle\Storage\SettingsRepository();
        \$repo->save_css('');
        \$repo->save_theme_json([]);
        \$repo->delete_theme_override('test-theme');
    " 2>/dev/null
}

# Test 7: Hooks are registered
test_hooks() {
    section "WordPress Hooks"

    # Check CSS enqueue hook
    local css_hook
    css_hook=$(wp_cmd eval "
        global \$wp_filter;
        echo isset(\$wp_filter['wp_enqueue_scripts']) ? 'registered' : 'missing';
    " 2>/dev/null)

    if [[ "$css_hook" == "registered" ]]; then
        pass "wp_enqueue_scripts hook registered"
    else
        fail "wp_enqueue_scripts hook not found"
    fi

    # Check theme.json filter
    local json_hook
    json_hook=$(wp_cmd eval "
        global \$wp_filter;
        echo isset(\$wp_filter['wp_theme_json_data_user']) ? 'registered' : 'missing';
    " 2>/dev/null)

    if [[ "$json_hook" == "registered" ]]; then
        pass "wp_theme_json_data_user filter registered"
    else
        fail "wp_theme_json_data_user filter not found"
    fi
}

# Summary
print_summary() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "  ${GREEN}Passed:${NC}  $TESTS_PASSED"
    echo -e "  ${RED}Failed:${NC}  $TESTS_FAILED"
    echo -e "  ${YELLOW}Skipped:${NC} $TESTS_SKIPPED"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    if [[ $TESTS_FAILED -gt 0 ]]; then
        exit 1
    fi
}

# Main
main() {
    echo "Multisite Override Style - Acceptance Tests"
    echo "Site: $SITE_URL"
    echo ""

    check_prerequisites
    test_rest_endpoints
    test_css_override
    test_theme_json_override
    test_theme_overrides
    test_exemptions
    test_export_import
    test_hooks

    print_summary
}

main "$@"
