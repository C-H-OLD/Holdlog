"""Regression checks for route identity, independent of a fixed screen count."""
import contextlib
import copy
import importlib.util
import io
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('contracts', ROOT / 'scripts/check-contracts.py')
contracts = importlib.util.module_from_spec(spec)
spec.loader.exec_module(contracts)


class RouteCoverage(unittest.TestCase):
    def setUp(self):
        """Isolate the loaded runtime contract for each mutation."""
        self.original = contracts.RUNTIME
        contracts.RUNTIME = copy.deepcopy(self.original)
        self.routes = contracts.RUNTIME['$defs']['Route']['properties']['screenId']['enum']

    def tearDown(self):
        """Restore the original contract so tests cannot leak mutations."""
        contracts.RUNTIME = self.original

    def check(self):
        """Run the complete static checker while suppressing success output."""
        with contextlib.redirect_stdout(io.StringIO()):
            contracts.main()

    def test_registered_notification_route_missing(self):
        """Detect the approved notification screen missing from Route."""
        if '05.07' in self.routes:
            self.routes.remove('05.07')
        with self.assertRaisesRegex(AssertionError, '05.07'):
            self.check()

    def test_unknown_route_replaces_registered_route_without_changing_count(self):
        """Reject an unknown route even when the enum size is unchanged."""
        self.routes[self.routes.index('00.01')] = '99.99'
        with self.assertRaisesRegex(AssertionError, '99.99'):
            self.check()

    def test_duplicate_route_replaces_registered_route_without_changing_count(self):
        """Reject duplicate routes independently of the enum size."""
        self.routes[self.routes.index('00.01')] = '01.01'
        with self.assertRaisesRegex(AssertionError, '중복'):
            self.check()

    def test_all_current_mobile_and_admin_routes_are_accepted(self):
        """Accept the currently approved mobile and admin screen set."""
        if '05.07' not in self.routes:
            self.routes.append('05.07')
        self.check()


if __name__ == '__main__':
    unittest.main()
